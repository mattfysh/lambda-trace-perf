import type { Spec } from './func'
import { layer } from './ext'

const REGION = 'ap-southeast-2'

export const tests: Spec[] = [
  // {
  //   id: 'baseline-notrace',
  //   notrace: true,
  // },
  // {
  //   id: 'baseline',
  // },
  // {
  //   id: 'ext-added',
  //   layers: [layer.arn],
  // },
  // {
  //   id: 'ext-active',
  //   layers: [layer.arn],
  //   variables: {
  //     TRACEPERF_EXT: '1',
  //   },
  // },
  {
    id: 'xray-sdk-span',
  },
  {
    id: 'adot-span',
    layers: [
      `arn:aws:lambda:${REGION}:901920570463:layer:aws-otel-nodejs-amd64-ver-1-9-1:2`
    ],
    variables: {
      AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
      OTEL_TRACES_SAMPLER: 'always_on',
    }
  }
]
