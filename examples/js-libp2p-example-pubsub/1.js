/* eslint-disable no-console */

import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { identify, identifyPush } from '@libp2p/identify'
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
    connectionEncrypters: [noise()],
    services: {
      pubsub: gossipsub(),
      identify: identify(),
      identifyPush: identifyPush()
    }
  })

  return node
}

const topic = 'news'

const [node1, node2] = await Promise.all([
  createNode(),
  createNode()
])

// Connect the two nodes
await node1.dial(node2.getMultiaddrs())

node1.services.pubsub.subscribe(topic)
node1.services.pubsub.addEventListener('message', (evt) => {
  console.log(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
})

// Will not receive own published messages by default
node2.services.pubsub.subscribe(topic)
node2.services.pubsub.addEventListener('message', (evt) => {
  console.log(`node2 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
})

// node2 publishes "news" every second
setInterval(() => {
  node2.services.pubsub.publish(topic, uint8ArrayFromString('Bird bird bird, bird is the word!')).catch(err => {
    console.error(err)
  })
}, 1000)
