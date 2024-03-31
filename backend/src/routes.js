import { IncomingMessage, ServerResponse } from 'node:http'
import url from 'node:url'
import { Server } from 'socket.io'

import UploadHandler from './uploadHandler.js'
import { logger, pipeline } from './util.js'


export default class Routes {
  #io
  /**
   * @param {Server} io 
   */
  constructor (io) {
    this.#io = io
  }


  /**
   * @param {IncomingMessage} request 
   * @param {ServerResponse} response 
   */
  async defaultRoute (request, response) {
    return response.end('Hello, World!')
  }


  /**
   * @param {IncomingMessage} request 
   * @param {ServerResponse} response 
   */
  async options (request, response) {
    response.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': '*'
    })
    return response.end()
  }


  /**
   * @param {IncomingMessage} request 
   * @param {ServerResponse} response 
   */
  async post (request, response) {
    const { headers } = request
    function onFinish () {
      response.writeHead(303, {
        connection: 'close',
        location: `${headers.origin}/?message=Files uploaded with success!`
      })
      return response.end()
    }
    const { query: { socketId }} = url.parse(request.url, true)
    const uploadHandler = new UploadHandler(this.#io, socketId)
    const busboy = uploadHandler.registerEvents(headers, onFinish)
    await pipeline(request, busboy)
    logger.info(`Request finished with success!`)
  }
}