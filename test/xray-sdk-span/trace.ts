import AWSXRay from 'aws-xray-sdk-core'

export const trace = <T>(name: string, fn: () => Promise<T>): Promise<T> =>
  AWSXRay.captureAsyncFunc(name, async sub => {
    const ret = await fn()
    sub?.close()
    return ret
  })
