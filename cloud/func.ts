import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import { role } from './role'

export type Spec = {
  id: string
  notrace?: boolean
  layers?: pulumi.Input<string>[]
  variables?: Record<string, string>
}

export const createFunc = (spec: Spec, memory: number) => {
  const func = new aws.lambda.Function(`traceperf-${spec.id}-${memory}`, {
    role: role.arn,
    handler: 'index.handler',
    runtime: 'nodejs18.x',
    timeout: 15,
    memorySize: memory,
    code: new pulumi.asset.FileArchive(`dist/${spec.id}`),
    layers: spec.layers,
    environment: {
      variables: spec.variables
    },
    tracingConfig: spec.notrace ? undefined : { mode: 'Active' },
  })
  return func.name
}
