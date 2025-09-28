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

// Add node's 2 data to the PeerStore
await node1.peerStore.patch(node2.peerId, {
  multiaddrs: node2.getMultiaddrs()
})

node1.handle('/node-1', (stream) => {
  stream.addEventListener('message', (evt) => {
    console.log(`from: ${stream.protocol}, msg: ${uint8ArrayToString(evt.data.subarray())}`)
  })
})

node2.handle('/node-2', (stream) => {
  stream.addEventListener('message', (evt) => {
    console.log(`from: ${stream.protocol}, msg: ${uint8ArrayToString(evt.data.subarray())}`)
  })
})

const stream1 = await node1.dialProtocol(node2.peerId, ['/node-2'])
stream1.send(uint8ArrayFromString('from 1 to 2'))

const stream2 = await node2.dialProtocol(node1.peerId, ['/node-1'])
stream2.send(uint8ArrayFromString('from 2 to 1'))
