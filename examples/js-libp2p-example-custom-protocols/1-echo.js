/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'

async function createNode () {
  return await createLibp2p({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0'
      ]
    },
    connectionEncrypters: [
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
await remote.handle(ECHO_PROTOCOL, (stream) => {
  // pipe the stream output back to the stream input
  stream.addEventListener('message', evt => {
    stream.send(evt.data)
  })

  // close the incoming writable end when the remote writable end closes
  stream.addEventListener('remoteCloseWrite', () => {
    stream.close()
  })
})

// the local will dial the remote on the protocol stream
const stream = await local.dialProtocol(remote.getMultiaddrs(), ECHO_PROTOCOL)

stream.addEventListener('message', (evt) => {
  // evt.data is a `Uint8ArrayList` so we must turn it into a `Uint8Array`
  // before decoding it
  console.info(`Echoed back to us: "${new TextDecoder().decode(evt.data.subarray())}"`)
})

// the stream input must be bytes
stream.send(new TextEncoder().encode('hello world'))
