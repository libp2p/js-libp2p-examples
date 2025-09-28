/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'
import { Uint8ArrayList } from 'uint8arraylist'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      // To signal the addresses we want to be available, we use
      // the multiaddr format, a self describable address
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()]
  })

  return node
}

function printAddrs (node, number) {
  console.log('node %s is listening on:', number)
  node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
}

const [node1, node2] = await Promise.all([
  createNode(),
  createNode()
])

printAddrs(node1, '1')
printAddrs(node2, '2')

node2.handle('/print', async (stream) => {
  const bufs = new Uint8ArrayList()

  stream.addEventListener('message', (evt) => {
    bufs.append(evt.data)
  })
  stream.addEventListener('remoteCloseWrite', () => {
    console.log(uint8ArrayToString(bufs.subarray()))
  })
})

await node1.peerStore.patch(node2.peerId, {
  multiaddrs: node2.getMultiaddrs()
})
const stream = await node1.dialProtocol(node2.peerId, '/print')

;['Hello', ' ', 'p2p', ' ', 'world', '!'].map(str => stream.send(uint8ArrayFromString(str)))
await stream.close()
