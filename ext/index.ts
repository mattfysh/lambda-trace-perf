#!/usr/bin/env node
import api from './extension-api'
import { listenerUrl, requestDone } from './telemetry-listener'
import { subscribe } from './telemetry-api'

const FN_TIMEOUT_GRACE = 500
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
  const msLeft = event.deadlineMs - Date.now() + FN_TIMEOUT_GRACE
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
    console.log('in loop...')
    const event = await api.next(extensionId)
    await handleEvent(event)
  }
}

process.on('exit', () => handleShutdown('Event: exit'))
process.on('SIGINT', () => handleShutdown('SIGINT'))
process.on('SIGTERM', () => handleShutdown('SIGTERM'))

main()
