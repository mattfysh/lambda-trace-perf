import { execa, $ } from 'execa'
import fs from 'node:fs/promises'
import { v4 as uuid } from 'uuid'
import { Lambda } from '@aws-sdk/client-lambda'

const lambda = new Lambda()

const REPEAT = 2

const runTS = Date.now()
const runDir = `bench/run-${runTS}`
await $`mkdir -p ${runDir}/res`

const $$ = $({stdio: 'inherit'})
await $$`sh scripts/build.sh`
await $$`pulumi up --yes`

const { stdout } = await $`pulumi stack output --json`
const { funcNames } = JSON.parse(stdout)

const extractStats = (line) => {
  const extractedStats = {}

  // Split the statistics string into an array of fields
  const fields = line.split('\t')

  // Loop through the fields and extract the statistics
  fields.forEach((field) => {
    if (field.startsWith('Duration: ')) {
      extractedStats.duration = field.substring('Duration: '.length)
    } else if (field.startsWith('Billed Duration: ')) {
      extractedStats.billedDuration = field.substring(
        'Billed Duration: '.length
      )
    } else if (field.startsWith('Memory Size: ')) {
      extractedStats.memorySize = field.substring('Memory Size: '.length)
    } else if (field.startsWith('Max Memory Used: ')) {
      extractedStats.maxMemoryUsed = field.substring('Max Memory Used: '.length)
    } else if (field.startsWith('Init Duration: ')) {
      extractedStats.initDuration = field.substring('Init Duration: '.length)
    }
  })

  return extractedStats
}

// parallel invoke
const bench = funcNames.map(async (name) => {
  const id = uuid()
  const runs = []
  for (let i = 0; i < REPEAT; i += 1) {
    const start = Date.now()
    const res = await lambda.invoke({
      FunctionName: name,
      LogType: 'Tail',
    })
    const clock = Date.now() - start
    const { LogResult } = res
    const log = Buffer.from(LogResult, 'base64').toString()
    const stats = extractStats(log.split('\n').find(line => line.startsWith('REPORT ')))
    runs.push({
      name,
      id,
      stats,
      clock
    })
  }
  await fs.writeFile(`${runDir}/${name}.json`, JSON.stringify(runs, null, 2))
})

await Promise.all(bench)
