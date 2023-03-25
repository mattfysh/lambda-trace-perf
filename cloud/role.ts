import * as aws from '@pulumi/aws'

export const role = new aws.iam.Role('traceperf-role', {
  assumeRolePolicy: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Principal: {
          Service: 'lambda.amazonaws.com',
        },
        Effect: 'Allow',
      },
    ],
  },
  inlinePolicies: [
    {
      name: 'write-logs',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
            ],
            Resource: 'arn:aws:logs:*:*:*',
            Effect: 'Allow',
          },
        ],
      }),
    },
    {
      name: 'write-tracing',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: {
          Effect: 'Allow',
          Action: ['xray:PutTraceSegments', 'xray:PutTelemetryRecords'],
          Resource: ['*'],
        },
      }),
    },
  ]
})
