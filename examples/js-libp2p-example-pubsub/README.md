# @libp2p/example-pubsub

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> An example using libp2p pubsub

We've seen many interesting use cases appear with this, here are some highlights:

- [Collaborative Text Editing](https://www.youtube.com/watch?v=-kdx8rJd8rQ)
- [IPFS PubSub (using libp2p-floodsub) for IoT](https://www.youtube.com/watch?v=qLpM5pBDGiE).
- [Real Time distributed Applications](https://www.youtube.com/watch?v=vQrbxyDPSXg)

## 0. Set up the example

Clone this repo and run `npm install` in the root.

## 1. Setting up a simple PubSub network on top of libp2p

For this example, we will use MulticastDNS for automatic Peer Discovery. This
example is based the previous examples found in
[Peer Discovery](https://github.com/libp2p/js-libp2p-example-discovery-mechanisms).

You can find the complete version at [1.js](./1.js).

Using PubSub is very simple, you only need to provide the implementation of your
choice and you are ready to go. No need for extra configuration.

First, let's update our libp2p configuration with a PubSub implementation.

```JavaScript
import { GossipSub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'

const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()],
    services: {
      // we add the Pubsub module we want
      pubsub: gossipsub()
    }
  })

  return node
}
```

Once that is done, we only need to create a few libp2p nodes, connect them and
everything is ready to start using pubsub.

```JavaScript
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

const topic = 'news'

const [node1, node2] = await Promise.all([
  createNode(),
  createNode()
])

// Connect the two nodes
await node1.dial(node2.getMultiaddrs())

node1.services.pubsub.addEventListener("message", (evt) => {
  console.log(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
})
await node1.services.pubsub.subscribe(topic)

// Will not receive own published messages by default
node2.services.pubsub.addEventListener("message", (evt) => {
  console.log(`node2 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
})
await node2.services.pubsub.subscribe(topic)

// node2 publishes "news" every second
setInterval(() => {
  node2.services.pubsub.publish(topic, uint8ArrayFromString('Bird bird bird, bird is the word!')).catch(err => {
    console.error(err)
  })
}, 1000)
```

The output of the program should look like:

```console
> node 1.js
connected to QmWpvkKm6qHLhoxpWrTswY6UMNWDyn8hN265Qp9ZYvgS82
node1 received: Bird bird bird, bird is the word!
node1 received: Bird bird bird, bird is the word!
```

You can change the pubsub `emitSelf` option if you want the publishing node to receive its own messages.

```JavaScript
gossipsub({ allowPublishToZeroPeers: true, emitSelf: true })
```

The output of the program should look like:

```console
> node 1.js
connected to QmWpvkKm6qHLhoxpWrTswY6UMNWDyn8hN265Qp9ZYvgS82
node1 received: Bird bird bird, bird is the word!
node2 received: Bird bird bird, bird is the word!
node1 received: Bird bird bird, bird is the word!
node2 received: Bird bird bird, bird is the word!
```

## 2. Filter Messages

To prevent undesired data from being propagated on the network, we can apply a
filter to Gossipsub. Messages that fail validation in the filter will not be
re-shared.

```JavaScript
import { TopicValidatorResult } from '@libp2p/interface/pubsub'

const validateFruit = (msgTopic, msg) => {
  const fruit = uint8ArrayToString(msg.data)
  const validFruit = ['banana', 'apple', 'orange']

  // car is not a fruit !
  if (!validFruit.includes(fruit)) {
    throw new Error('no valid fruit received')
  }
  return TopicValidatorResult.Accept
}

node1.services.pubsub.topicValidators.set(topic, validateFruit)
node2.services.pubsub.topicValidators.set(topic, validateFruit)
node3.services.pubsub.topicValidators.set(topic, validateFruit)
```

In this example, node one has an outdated version of the system, or is a malicious node. When it tries to publish fruit, the messages are re-shared and all the nodes share the message. However, when it tries to publish a vehicle the message is not re-shared.

```JavaScript
for (const fruit of ['banana', 'apple', 'car', 'orange']) {
  console.log('############## fruit ' + fruit + ' ##############')
  await node1.services.pubsub.publish(topic, uint8ArrayFromString(fruit))
}
```

Result

```
> node 1.js
############## fruit banana ##############
node2 received: banana
node3 received: banana
############## fruit apple ##############
node2 received: apple
node3 received: apple
############## fruit car ##############
############## fruit orange ##############
node1 received: orange
node2 received: orange
node3 received: orange
```

You can find the complete version at [2.js](./2.js).

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
