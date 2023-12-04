/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { lpStream } from 'it-length-prefixed-stream'
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
const REQ_RESP_PROTOCOL = '/request-response/1.0.0'

// the remote will handle incoming streams opened on the protocol
await remote.handle(REQ_RESP_PROTOCOL, ({ stream }) => {
  Promise.resolve().then(async () => {
    // lpStream lets us read/write in a predetermined order
    const lp = lpStream(stream)

    // read the incoming request
    const req = await lp.read()

    // deserialize the query
    const query = JSON.parse(new TextDecoder().decode(req.subarray()))

    if (query.question === 'What is the air-speed velocity of an unladen swallow?') {
      // write the response
      await lp.write(new TextEncoder().encode(JSON.stringify({
        answer: 'Is that an African or a European swallow?'
      })))
    } else {
      // write the response
      await lp.write(new TextEncoder().encode(JSON.stringify({
        error: "What? I don't know?!"
      })))
    }
  })
    .catch(err => {
      stream.abort(err)
    })
})

// the local will dial the remote on the protocol stream
const stream = await local.dialProtocol(remote.getMultiaddrs(), REQ_RESP_PROTOCOL)

// lpStream lets us read/write in a predetermined order
const lp = lpStream(stream)

// send the query
await lp.write(new TextEncoder().encode(JSON.stringify({
  question: 'What is the air-speed velocity of an unladen swallow?'
})))

// read the response
const res = await lp.read()
const output = JSON.parse(new TextDecoder().decode(res.subarray()))

console.info(`The answer is: "${output.answer}"`)

await remote.stop()
await local.stop()
