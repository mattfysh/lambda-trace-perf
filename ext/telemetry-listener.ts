import { createServer } from 'node:http'
import { text } from 'node:stream/consumers'
import { EventEmitter, once } from 'node:events'

const LISTENER_HOST = 'sandbox.localdomain'
const LISTENER_PORT = 4243

const doneSignals = new EventEmitter()

export const requestDone = (id: string, timeoutMs: number) => {
  const done = once(doneSignals, id)
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('requestDone timeout')),
      timeoutMs
    )
  )
  return Promise.race([done, timeout])
}

type TelemetryEvent = {
  type: string
  record: {
    requestId: string
  }
}

const server = createServer(async (req, res) => {
  res.writeHead(200)
  res.end('OK')
  const body = JSON.parse(await text(req)) as TelemetryEvent[]
  body
    .filter((x) => x.type === 'platform.runtimeDone')
    .forEach((x) => doneSignals.emit(x.record.requestId))
})

const listenerUrl = `http://${LISTENER_HOST}:${LISTENER_PORT}`
server.listen(LISTENER_PORT, LISTENER_HOST, () => {
  console.log(`[telemetry-listener:start] listening at ${listenerUrl}`)
})

export { listenerUrl }
