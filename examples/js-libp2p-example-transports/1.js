/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'

const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      // To signal the addresses we want to be available, we use
      // the multiaddr format, a self describable address
      listen: [
        '/ip4/0.0.0.0/tcp/0'
      ]
    },
    transports: [
      tcp()
    ],
    connectionEncrypters: [
      noise()
    ]
  })

  return node
}

const node = await createNode()

console.log('node has started')
console.log('listening on:')
node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
