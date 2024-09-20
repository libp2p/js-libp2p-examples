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

// Add node's 2 data to the PeerStore
await node1.peerStore.patch(node2.peerId, {
  multiaddrs: node2.getMultiaddrs()
})

node2.handle(['/a', '/b'], ({ protocol, stream }) => {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(`from: ${protocol}, msg: ${uint8ArrayToString(msg.subarray())}`)
      }
    }
  ).finally(() => {
    // clean up resources
    stream.close()
  })
})

const stream1 = await node1.dialProtocol(node2.peerId, ['/a'])
await pipe(
  [uint8ArrayFromString('protocol (a)')],
  stream1
)

const stream2 = await node1.dialProtocol(node2.peerId, ['/b'])
await pipe(
  [uint8ArrayFromString('protocol (b)')],
  stream2
)

const stream3 = await node1.dialProtocol(node2.peerId, ['/b'])
await pipe(
  [uint8ArrayFromString('another stream on protocol (b)')],
  stream3
)
