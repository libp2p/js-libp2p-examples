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

node2.handle(['/a', '/b'], (stream) => {
  stream.addEventListener('message', (evt) => {
    console.log(`from: ${stream.protocol}, msg: ${uint8ArrayToString(evt.data.subarray())}`)
  })
  stream.addEventListener('remoteCloseWrite', () => {
    // clean up resources
    stream.close()
      .catch(err => {
        stream.abort(err)
      })
  })
})

const stream = await node1.dialProtocol(node2.peerId, ['/a'])
stream.send(uint8ArrayFromString('protocol (a)'))

const stream2 = await node1.dialProtocol(node2.peerId, ['/b'])
stream2.send(uint8ArrayFromString('protocol (b)'))

const stream3 = await node1.dialProtocol(node2.peerId, ['/b'])
stream3.send(uint8ArrayFromString('another stream on protocol (b)'))
