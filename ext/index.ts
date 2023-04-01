#!/usr/bin/env node
import api from './extension-api'
import { listenerUrl, requestDone } from './telemetry-listener'
import { subscribe } from './telemetry-api'

const TIMEOUT_CLEANUP_WINDOW = 500
const EXT_ENABLED = Boolean(process.env['TRACEPERF_EXT'])

type LambdaExtEvent = {
  requestId: string
  deadlineMs: number
}

const EventType = {
  INVOKE: 'INVOKE',
  SHUTDOWN: 'SHUTDOWN',
}

async function handleInvoke(event: LambdaExtEvent) {
  const msLeft = event.deadlineMs - Date.now() - TIMEOUT_CLEANUP_WINDOW
  await requestDone(event.requestId, msLeft)
}

async function handleShutdown(event: any) {
  console.log('Shutting down', event)
  process.exit(0)
}

async function handleEvent(event: any) {
  switch (event.eventType) {
    case EventType.INVOKE:
      return handleInvoke(event)
    case EventType.SHUTDOWN:
      return handleShutdown(event)
    default:
      throw new Error('unknown event: ' + event.eventType)
  }
}

async function main() {
  const events = EXT_ENABLED ? ['INVOKE', 'SHUTDOWN'] : []
  const extensionId = await api.register(events)
  if (EXT_ENABLED) {
    await subscribe(extensionId, listenerUrl)
  }
  while (true) {
    const event = await api.next(extensionId)
    await handleEvent(event)
  }
}

process.on('SIGINT', () => handleShutdown('SIGINT'))
process.on('SIGTERM', () => handleShutdown('SIGTERM'))

main().catch(e => {
  console.error('MAIN ERROR')
  console.error(e)
  throw e
})
