import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { Server } from 'socket.io'

import { PORT } from './config.js'
import Routes from './routes.js'
import { logger } from './util.js'


/**
 * @param {IncomingMessage} request 
 * @param {ServerResponse} response 
 */
function requestListener (request, response) {
  const routes = new Routes(io)
  const chosen = routes[request.method.toLowerCase()] || routes.defaultRoute
  return chosen.apply(routes, [request, response])
}


const server = createServer(requestListener)

const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: false
  }
})

io.on('connection', socket => logger.info(`Someone has connected ${socket.id}`))

server.listen(PORT, () => logger.info(`Server running at ${PORT}`))