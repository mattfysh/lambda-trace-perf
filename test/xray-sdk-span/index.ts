import { trace } from './trace'

export async function handler() {
  return trace('example-span', async () => 'hello')
}
