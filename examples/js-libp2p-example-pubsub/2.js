/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { gossipsub, TopicValidatorResult } from '@libp2p/gossipsub'
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

// Subscriptions propagating tells us the peers know who is interested, but that is
// not enough to publish yet. gossipsub only forwards a message to the peers in its
// mesh, and the mesh is built asynchronously, a little after subscriptions. A
// message published before the mesh is ready is silently dropped: pubsub is
// best-effort and makes no delivery guarantee. So also wait until the mesh has
// formed along node1 -> node2 -> node3.
//
// NOTE: getMeshPeers and the 'gossipsub:graft' event used below are gossipsub
// specific, they are not part of the general PubSub interface. They are convenient
// here to keep the example deterministic, and you are free to use them. A real
// application, though, is better built against the general PubSub interface and
// treated as unreliable: republish until you observe delivery, or tolerate missed
// messages, rather than depending on the mesh being ready.
await waitForMeshPeer(node1, node2, topic)
await waitForMeshPeer(node2, node3, topic)

const validateFruit = (msgTopic, msg) => {
  const fruit = uint8ArrayToString(msg.data)
  const validFruit = ['banana', 'apple', 'orange']

  return validFruit.includes(fruit)
    ? TopicValidatorResult.Accept
    : TopicValidatorResult.Ignore
}

// validate fruit
node1.services.pubsub.topicValidators.set(topic, validateFruit)
node2.services.pubsub.topicValidators.set(topic, validateFruit)
node3.services.pubsub.topicValidators.set(topic, validateFruit)

// node1 publishes "fruits", waiting for each to reach node3 before sending the
// next so we can watch it propagate. 'car' fails validation and is never
// re-shared, so waitForMessage gives up on it after a short timeout.
for (const fruit of ['banana', 'apple', 'car', 'orange']) {
  console.log('############## fruit ' + fruit + ' ##############')

  const received = waitForMessage(node3, topic, fruit)
  await node1.services.pubsub.publish(topic, uint8ArrayFromString(fruit))
  await received
}

console.log('############## all messages sent ##############')

async function delay (ms) {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

// Wait for `node` to receive `data` on `topic`. Fruit that fails validation is
// never re-shared, so give up after `timeout` ms.
async function waitForMessage (node, topic, data, timeout = 100) {
  await new Promise((resolve) => {
    const timer = setTimeout(done, timeout)

    function done () {
      clearTimeout(timer)
      node.services.pubsub.removeEventListener('message', onMessage)
      resolve()
    }

    function onMessage (evt) {
      if (evt.detail.topic === topic && uint8ArrayToString(evt.detail.data) === data) {
        done()
      }
    }

    node.services.pubsub.addEventListener('message', onMessage)
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

// Wait for `node` to graft `peer` into its gossipsub mesh for `topic`, i.e. it will
// now forward messages on that topic to `peer`. Resolves on the gossipsub specific
// 'gossipsub:graft' event, and also checks getMeshPeers up front in case the graft
// happened before we started listening.
async function waitForMeshPeer (node, peer, topic) {
  const peerId = peer.peerId.toString()

  await new Promise((resolve) => {
    function done () {
      node.services.pubsub.removeEventListener('gossipsub:graft', onGraft)
      resolve()
    }

    function onGraft (evt) {
      if (evt.detail.topic === topic && evt.detail.peerId === peerId) {
        done()
      }
    }

    node.services.pubsub.addEventListener('gossipsub:graft', onGraft)

    // the graft may already have happened before we attached the listener
    if (node.services.pubsub.getMeshPeers(topic).includes(peerId)) {
      done()
    }
  })
}
