/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { pipe } from 'it-pipe'
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
node2.handle('/your-protocol', ({ stream }) => {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    }
  )
})

// multiple protocols
/*
node2.handle(['/another-protocol/1.0.0', '/another-protocol/2.0.0'], ({ protocol, stream }) => {
  if (protocol === '/another-protocol/2.0.0') {
    // handle backwards compatibility
  }

  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    }
  )
})
*/
console.log(node2.getMultiaddrs())
const pId = console.log(node2.peerId.toString())
const stream = await node1.dialProtocol(node2.peerId, ['/your-protocol'])
await pipe(
  [uint8ArrayFromString('my own protocol, wow!')],
  stream
)

/*
const stream = await node1.dialProtocol(node2.getMultiaddrs(), ['/another-protocol/1.0.0'])

await pipe(
  [uint8ArrayFromString('my own protocol, wow!')],
  stream
)
*/
