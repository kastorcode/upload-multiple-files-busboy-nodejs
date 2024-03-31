import { createWriteStream } from 'node:fs'
import { dirname, join } from 'node:path'

import Busboy from 'busboy'
import { Server } from 'socket.io'

import { ON_UPLOAD_EVENT } from './config.js'
import { logger, pipeline } from './util.js'


const { pathname } = new URL(import.meta.url)
const __dirname = dirname(pathname)


export default class UploadHandler {
  #io
  #socketId
  /**
   * @param {Server} io 
   * @param {string} socketId 
   */
  constructor (io, socketId) {
    this.#io = io
    this.#socketId = socketId
  }

  #handleFileBytes (filename) {
    async function* handleData (data) {
      for await (const item of data) {
        this.#io.to(this.#socketId).emit(ON_UPLOAD_EVENT, item.length)
        yield item
      }
    }
    return handleData.bind(this)
  }

  async #onFile (fieldname, file, filename) {
    const saveFileTo = join(__dirname, '../', 'downloads', filename)
    logger.info(`Uploading: ${saveFileTo}`)
    await pipeline(
      file,
      this.#handleFileBytes.apply(this, [filename]),
      createWriteStream(saveFileTo)
    )
    logger.info(`File [${filename}] finished!`)
  }

  registerEvents (headers, onFinish) {
    const busboy = new Busboy({ headers })
    busboy.on('file', this.#onFile.bind(this))
    busboy.on('finish', onFinish)
    return busboy
  }
}