import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

const layerCode = new pulumi.asset.AssetArchive({
  'traceperf-ext': new pulumi.asset.FileArchive('dist/ext'),
  'extensions/traceperf-ext': new pulumi.asset.FileAsset('ext/traceperf-ext'),
})

export const layer = new aws.lambda.LayerVersion('traceperf-ext', {
  code: layerCode,
  layerName: 'traceperf-ext',
  compatibleRuntimes: ['nodejs18.x'],
})
