import { trace } from './trace'

const handler = async () => {
  return trace('example-span', async () => 'hello')
}

module.exports = { handler }
