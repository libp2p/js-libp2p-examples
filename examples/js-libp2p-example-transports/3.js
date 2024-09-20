/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { pipe } from 'it-pipe'
import { createLibp2p } from 'libp2p'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const createNode = async (transports, addresses = []) => {
  if (!Array.isArray(addresses)) {
    addresses = [addresses]
  }

  const node = await createLibp2p({
    addresses: {
      listen: addresses
    },
    transports,
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()]
  })

  return node
}

function printAddrs (node, number) {
  console.log('node %s is listening on:', number)
  node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
}

function print ({ stream }) {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    }
  )
}

const [node1, node2, node3] = await Promise.all([
  createNode([tcp()], '/ip4/0.0.0.0/tcp/0'),
  createNode([tcp(), webSockets()], ['/ip4/0.0.0.0/tcp/0', '/ip4/127.0.0.1/tcp/10000/ws']),
  createNode([webSockets()], '/ip4/127.0.0.1/tcp/20000/ws')
])

printAddrs(node1, '1')
printAddrs(node2, '2')
printAddrs(node3, '3')

node1.handle('/print', print)
node2.handle('/print', print)
node3.handle('/print', print)

await node1.peerStore.patch(node2.peerId, {
  multiaddrs: node2.getMultiaddrs()
})
await node2.peerStore.patch(node3.peerId, {
  multiaddrs: node3.getMultiaddrs()
})
await node3.peerStore.patch(node1.peerId, {
  multiaddrs: node1.getMultiaddrs()
})

// node 1 (TCP) dials to node 2 (TCP+WebSockets)
const stream = await node1.dialProtocol(node2.peerId, '/print')
await pipe(
  [uint8ArrayFromString('node 1 dialed to node 2 successfully')],
  stream
)

// node 2 (TCP+WebSockets) dials to node 3 (WebSockets)
const stream2 = await node2.dialProtocol(node3.peerId, '/print')
await pipe(
  [uint8ArrayFromString('node 2 dialed to node 3 successfully')],
  stream2
)

// node 3 (listening WebSockets) can dial node 1 (TCP)
try {
  await node3.dialProtocol(node1.peerId, '/print')
} catch (err) {
  console.log('node 3 failed to dial to node 1 with:', err.message)
}
