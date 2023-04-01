import * as http from 'node:http'
import * as consumers from 'node:stream/consumers'

const apiHost = process.env['AWS_LAMBDA_RUNTIME_API']
const baseUrl = `http://${apiHost}/2020-01-01/extension`

async function register(events: string[]) {
  const res = await fetch(`${baseUrl}/register`, {
    method: 'post',
    body: JSON.stringify({ events }),
    headers: {
      'Content-Type': 'application/json',
      'Lambda-Extension-Name': 'traceperf-ext',
    },
  })

  if (!res.ok) {
    console.error('register failed', await res.text())
  }

  const extensionId = res.headers.get('lambda-extension-identifier')
  if (!extensionId) {
    throw new Error('Unable to retrieve extension identifier')
  }
  return extensionId
}

async function next(extensionId: string) {
  // the native fetch implemented in node has a non-configurable
  // 5 minute timeout, so the http.get client is used instead
  const req = http.get(`${baseUrl}/event/next`, {
    headers: {
      'Lambda-Extension-Identifier': extensionId,
    },
  })

  return new Promise((resolve, reject) => {
    req.on('error', reject)
    req.on('response', async (res) => {
      res.on('error', reject)

      let text: string = ''
      try {
        text = await consumers.text(res)
      } catch (e) {}

      if (res.statusCode !== 200) {
        reject(new Error(`Next failed: ${text}`))
      }

      resolve(JSON.parse(text))
    })
  })
}

export default {
  register,
  next,
}
