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

const topic = 'fruit'

const [node1, node2, node3] = await Promise.all([
  createNode(),
  createNode(),
  createNode()
])

// connect node1 to node2 and node2 to node3
await node1.dial(node2.getMultiaddrs())
await node2.dial(node3.getMultiaddrs())

// subscribe
node1.services.pubsub.addEventListener('message', (evt) => {
  if (evt.detail.topic !== topic) {
    return
  }

  // Will not receive own published messages by default
  console.log(`node1 received: ${uint8ArrayToString(evt.detail.data)}`)
})
node1.services.pubsub.subscribe(topic)

node2.services.pubsub.addEventListener('message', (evt) => {
  if (evt.detail.topic !== topic) {
    return
  }

  console.log(`node2 received: ${uint8ArrayToString(evt.detail.data)}`)
})
node2.services.pubsub.subscribe(topic)

node3.services.pubsub.addEventListener('message', (evt) => {
  if (evt.detail.topic !== topic) {
    return
  }

  console.log(`node3 received: ${uint8ArrayToString(evt.detail.data)}`)
})
node3.services.pubsub.subscribe(topic)

// wait for subscriptions to propagate
await hasSubscription(node1, node2, topic)
await hasSubscription(node2, node3, topic)

const validateFruit = (msgTopic, msg) => {
  const fruit = uint8ArrayToString(msg.data)
  const validFruit = ['banana', 'apple', 'orange']

  return validFruit.includes(fruit) ? 'accept' : 'ignore'
}

// validate fruit
node1.services.pubsub.topicValidators.set(topic, validateFruit)
node2.services.pubsub.topicValidators.set(topic, validateFruit)
node3.services.pubsub.topicValidators.set(topic, validateFruit)

// node1 publishes "fruits"
for (const fruit of ['banana', 'apple', 'car', 'orange']) {
  console.log('############## fruit ' + fruit + ' ##############')
  await node1.services.pubsub.publish(topic, uint8ArrayFromString(fruit))
}

console.log('############## all messages sent ##############')

async function delay (ms) {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

// Wait for node1 to see that node2 has subscribed to the topic
async function hasSubscription (node1, node2, topic) {
  while (true) {
    const subs = await node1.services.pubsub.getSubscribers(topic)

    if (subs.map(peer => peer.toString()).includes(node2.peerId.toString())) {
      return
    }

    // wait for subscriptions to propagate
    await delay(100)
  }
}
