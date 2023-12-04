/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { pipe } from 'it-pipe'
import { createLibp2p } from 'libp2p'

async function createNode () {
  return await createLibp2p({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0'
      ]
    },
    connectionEncryption: [
      noise()
    ],
    streamMuxers: [
      yamux()
    ],
    transports: [
      tcp()
    ]
  })
}

// create two nodes
const remote = await createNode()
const local = await createNode()

// this is our protocol id
const ECHO_PROTOCOL = '/echo/1.0.0'

// the remote will handle incoming streams opened on the protocol
await remote.handle(ECHO_PROTOCOL, ({ stream }) => {
  // pipe the stream output back to the stream input
  pipe(stream, stream)
})

// the local will dial the remote on the protocol stream
const stream = await local.dialProtocol(remote.getMultiaddrs(), ECHO_PROTOCOL)

// now it will write some data and read it back
const output = await pipe(
  async function * () {
    // the stream input must be bytes
    yield new TextEncoder().encode('hello world')
  },
  stream,
  async (source) => {
    let string = ''
    const decoder = new TextDecoder()

    for await (const buf of source) {
      // buf is a `Uint8ArrayList` so we must turn it into a `Uint8Array`
      // before decoding it
      string += decoder.decode(buf.subarray())
    }

    return string
  }
)

console.info(`Echoed back to us: "${output}"`)

await remote.stop()
await local.stop()
