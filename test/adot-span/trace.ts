import { trace as _trace } from '@opentelemetry/api'

export const trace = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const span = _trace.getTracer('example-tracer').startSpan(name)
  const ret = await fn()
  span.end()
  return ret
}
