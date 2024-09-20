/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { createLibp2p } from 'libp2p'

const server = await createLibp2p({
  addresses: {
    listen: ['/ip4/127.0.0.1/tcp/0/ws']
  },
  transports: [
    webSockets({
      filter: filters.all
    })
  ],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    relay: circuitRelayServer({
      // disable max reservations limit for demo purposes. in production you
      // should leave this set to the default of 15 to prevent abuse of your
      // node by network peers
      reservations: {
        maxReservations: Infinity
      }
    })
  }
})

console.info('The relay node is running and listening on the following multiaddrs:')
console.info('')
console.info(server.getMultiaddrs().map((ma) => ma.toString()).join('\n'))
