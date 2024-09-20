/* eslint no-console: ["off"] */

import { generateKey } from '@libp2p/pnet'
import { pipe } from 'it-pipe'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { privateLibp2pNode } from './libp2p-node.js'

// Create a Uint8Array and write the swarm key to it
const swarmKey = new Uint8Array(95)
generateKey(swarmKey)

// This key is for testing a different key not working
const otherSwarmKey = new Uint8Array(95)
generateKey(otherSwarmKey)

const node1 = await privateLibp2pNode(swarmKey)

// TASK: switch the commented out line below so we're using a different key, to see the nodes fail to connect
const node2 = await privateLibp2pNode(swarmKey)
// const node2 = await privateLibp2pNode(otherSwarmKey)

console.log('nodes started...')

// connect node1 to node2
await node1.dial(node2.getMultiaddrs())

node2.handle('/private', ({ stream }) => {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    }
  )
})

const stream = await node1.dialProtocol(node2.peerId, '/private')

await pipe(
  [uint8ArrayFromString('This message is sent on a private network')],
  stream
)
