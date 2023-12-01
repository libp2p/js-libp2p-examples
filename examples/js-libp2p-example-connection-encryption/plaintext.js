/* eslint-disable no-console */

import { yamux } from '@chainsafe/libp2p-yamux'
import { plaintext } from '@libp2p/plaintext'
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
    connectionEncryption: [plaintext()]
  })

  return node
}

const node1 = await createNode()
const node2 = await createNode()

node2.handle('/a-protocol', ({ stream }) => {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    }
  )
})

const stream = await node1.dialProtocol(node2.getMultiaddrs(), '/a-protocol')

await pipe(
  [uint8ArrayFromString('This information is sent out encrypted to the other peer')],
  stream
)
