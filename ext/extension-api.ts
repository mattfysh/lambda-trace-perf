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
  const res = await fetch(`${baseUrl}/event/next`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'Lambda-Extension-Identifier': extensionId,
    },
  })

  if (!res.ok) {
    console.error('next failed', await res.text())
    return null
  }

  return await res.json()
}

export default {
  register,
  next,
}
