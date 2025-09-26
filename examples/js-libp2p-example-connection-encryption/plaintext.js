/* eslint-disable no-console */

import { yamux } from '@chainsafe/libp2p-yamux'
import { plaintext } from '@libp2p/plaintext'
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
    connectionEncrypters: [plaintext()]
  })

  return node
}

const node1 = await createNode()
const node2 = await createNode()

node2.handle('/a-protocol', (stream) => {
  stream.addEventListener('message', (evt) => {
    console.log(uint8ArrayToString(evt.data.subarray()))
  })
})

const stream = await node1.dialProtocol(node2.getMultiaddrs(), '/a-protocol')

stream.send(uint8ArrayFromString('This information is sent out encrypted to the other peer'))
