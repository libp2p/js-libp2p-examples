/* eslint-disable no-console */
import { createDelegatedRoutingV1HttpApiServer } from '@helia/delegated-routing-v1-http-api-server'
import { createHelia } from 'helia'

const helia = await createHelia()

const fastify = await createDelegatedRoutingV1HttpApiServer(helia, {
  listen: {
    host: '127.0.0.1',
    port: 9832,
    listenTextResolver: (address) => { return `server is listening at ${address}` }
  }
})

console.info(`Server listening on http://${fastify.server.address().address}:${fastify.server.address().port}`)
