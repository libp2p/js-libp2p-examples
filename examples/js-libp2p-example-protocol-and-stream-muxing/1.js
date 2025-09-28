/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()]
  })

  return node
}

const [node1, node2] = await Promise.all([
  createNode(),
  createNode()
])

// exact matching
node2.handle('/your-protocol', (stream) => {
  stream.addEventListener('message', (evt) => {
    console.log(uint8ArrayToString(evt.data.subarray()))
  })
})

// multiple protocols
/*
node2.handle(['/another-protocol/1.0.0', '/another-protocol/2.0.0'], (stream) => {
  if (stream.protocol === '/another-protocol/2.0.0') {
    // handle backwards compatibility
  }

  stream.addEventListener('message', (evt) => {
    console.log(uint8ArrayToString(evt.data.subarray()))
  })
})
*/

const stream = await node1.dialProtocol(node2.getMultiaddrs(), ['/your-protocol'])

stream.send(uint8ArrayFromString('my own protocol, wow!'))

/*
const stream = node1.dialProtocol(node2.peerId, ['/another-protocol/1.0.0'])

stream.send(uint8ArrayFromString('my own protocol, wow!'))
*/
