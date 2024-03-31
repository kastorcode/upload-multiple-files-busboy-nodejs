import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import pino from 'pino'


const pipelineAsync = promisify(pipeline)

const logger = pino({
  prettyPrint: {
    ignore: 'pid,hostname'
  }
})


export {
  logger,
  pipelineAsync as pipeline,
  promisify
}