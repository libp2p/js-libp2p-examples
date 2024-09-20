/* eslint-disable no-console */

import fs from 'fs'
import https from 'https'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { pipe } from 'it-pipe'
import { createLibp2p } from 'libp2p'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const httpServer = https.createServer({
  cert: fs.readFileSync('./test_certs/cert.pem'),
  key: fs.readFileSync('./test_certs/key.pem')
})

const createNode = async (addresses = []) => {
  if (!Array.isArray(addresses)) {
    addresses = [addresses]
  }

  const node = await createLibp2p({
    addresses: {
      listen: addresses
    },
    transports: [
      tcp(),
      webSockets({
        server: httpServer,
        websocket: {
          rejectUnauthorized: false
        }
      })
    ],
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

const [node1, node2] = await Promise.all([
  createNode('/ip4/127.0.0.1/tcp/10000/wss'),
  createNode([])
])

printAddrs(node1, '1')
printAddrs(node2, '2')

node1.handle('/print', print)
node2.handle('/print', print)

const targetAddr = node1.getMultiaddrs()[0]

// node 2 (Secure WebSockets) dials to node 1 (Secure Websockets)
const stream = await node2.dialProtocol(targetAddr, '/print')
await pipe(
  [uint8ArrayFromString('node 2 dialed to node 1 successfully')],
  stream
)
