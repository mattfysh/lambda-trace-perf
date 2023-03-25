import { createFunc } from './func'
import { tests } from './tests'

export const funcNames = tests.flatMap((test) => [
  createFunc(test, 128),
  createFunc(test, 512),
  createFunc(test, 1024),
  createFunc(test, 1769), // = 1vCPU
  createFunc(test, 2501)
])
