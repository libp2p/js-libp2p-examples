# @libp2p/example-protocol-and-stream-muxing

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> How to use multiplex protocols streams

The feature of agreeing on a protocol over an established connection is what we
call *protocol multiplexing* and it is possible through
[multistream-select](https://github.com/multiformats/multistream), another
protocol that lets you agree per connection (or stream) which protocol is going
to be talked over that connection (select), it also enables you to request the
other end to tell you which protocols it supports (ls). You can learn more about
multistream-select at its
[specification repo](https://github.com/multiformats/multistream).

## 1. Handle multiple protocols

Let's see *protocol multiplexing* in action! You will need the following modules
for this example: `libp2p`, `@libp2p/tcp`, `@libp2p/peer-id`, `it-pipe`,
`it-buffer` and `streaming-iterables`. This example reuses the base left by the
[Transports](../transports) example. You can see the complete solution at
[1.js](./1.js).

After creating the nodes, we need to tell libp2p which protocols to handle.

```JavaScript
import { pipe } from 'it-pipe'
import { map } from 'streaming-iterables'
import { toBuffer } from 'it-buffer'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

// ...
const [node1, node2] = await Promise.all([
  createNode(),
  createNode()
])

// Add node's 2 data to the PeerStore
await node1.peerStore.patch(node2.peerId, {
  multiaddrs: node2.getMultiaddrs()
})

// Here we are telling libp2p that if someone dials this node to talk with the `/your-protocol`
// multicodec, the protocol identifier, please call this handler and give it the stream
// so that incomming data can be handled
node2.handle('/your-protocol', ({ stream }) => {
  pipe(
    stream,
    source => (async function () {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    })()
  )
})
```

After the protocol is *handled*, now we can dial to it.

```JavaScript
const stream = await node1.dialProtocol(node2.peerId, ['/your-protocol'])

await pipe(
  [uint8ArrayFromString('my own protocol, wow!')],
  stream
)
```

You might have seen this in the [Transports](../transports) examples. However,
what it was not explained is that you can do more than exact string matching,
for example, you can use semver.

```JavaScript
node2.handle('/another-protocol/1.0.1', ({ stream }) => {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    }
  )
})
// ...
const stream = await node1.dialProtocol(node2.peerId, ['/another-protocol/1.0.0'])

await pipe(
  [uint8ArrayFromString('my own protocol, wow!')],
  stream
)
```

This feature is super power for network protocols. It works in the same way as
versioning your RPC/REST API, but for anything that goes in the wire. We had to
use this feature to upgrade protocols within the IPFS Stack (i.e Bitswap) and we
successfully managed to do so without any network splits.

There is still one last feature, you can provide multiple protocols for the same
handler. If you have a backwards incompatible change, but it only requires minor
changes to the code, you may prefer to do protocol checking instead of having
multiple handlers

```JavaScript
node2.handle(['/another-protocol/1.0.0', '/another-protocol/2.0.0'], ({ stream }) => {
  if (stream.protocol === '/another-protocol/2.0.0') {
    // handle backwards compatibility
  }

  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    }
  )
})
```

Try all of this out by executing [1.js](./1.js).

## 2. Reuse existing connection

The examples above would require a node to create a whole new connection for
every time it dials in one of the protocols, this is a waste of resources and
also it might be simply not possible (e.g lack of file descriptors, not enough
ports being open, etc). What we really want is to dial a connection once and
then multiplex several virtual connections (stream) over a single connection,
this is where *stream multiplexing* comes into play.

Stream multiplexing is an old concept, in fact it happens in many of the layers
of the [OSI System](https://en.wikipedia.org/wiki/OSI_model). In libp2p, we make
this feature to our avail by letting the user pick which module for stream
multiplexing to use.

Currently, we have [libp2p-mplex](https://github.com/libp2p/js-libp2p-mplex) and
pluging it in is as easy as adding a transport. Let's revisit our libp2p
configuration.

```JavaScript
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { yamux } from '@chainsafe/libp2p-yamux'

//...

createLibp2p({
  //...
  transports: [
    tcp()
  ],
  streamMuxers: [
    yamux()
  ]
})

```

With this, we can dial as many times as we want to a peer and always reuse the
same established underlying connection.

```JavaScript
node2.handle(['/a', '/b'], ({ stream }) => {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(`from: ${stream.protocol}, msg: ${uint8ArrayToString(msg.subarray())}`)
      }
    }
  )
})

const stream = await node1.dialProtocol(node2.peerId, ['/a'])
await pipe(
  [uint8ArrayFromString('protocol (a)')],
  stream
)

const stream2 = await node1.dialProtocol(node2.peerId, ['/b'])
await pipe(
  [uint8ArrayFromString('protocol (b)')],
  stream2
)

const stream3 = await node1.dialProtocol(node2.peerId, ['/b'])
await pipe(
  [uint8ArrayFromString('another stream on protocol (b)')],
  stream3
)
```

By running [2.js](./2.js) you should see the following result:

```
> node 2.js
from: /a, msg: protocol (a)
from: /b, msg: protocol (b)
from: /b, msg: another stream on protocol (b)
```

## 3. Bidirectional connections

There is one last trick on *protocol and stream multiplexing* that libp2p uses
to make everyone's life easier and that is *bidirectional connection*.

With the aid of both mechanisms, we can reuse an incomming connection to dial
streams out too, this is specially useful when you are behind tricky NAT,
firewalls or if you are running in a browser, where you can't have listening
addrs, but you can dial out. By dialing out, you enable other peers to talk with
you in Protocols that they want, simply by opening a new multiplexed stream.

You can see this working on example [3.js](./3.js).

As we've seen earlier, we can create our node with this createNode function.

```js
const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    streamMuxers: [yamux(), mplex()],
    connectionEncrypters: [noise()],
  })

  return node
}
```

We can now create our two nodes for this example.

```js
const [node1, node2] = await Promise.all([
  createNode(),
  createNode()
])
```

Since, we want to connect these nodes `node1` & `node2`, we add our `node2`
multiaddr in key-value pair in `node1` peer store.

```js
await node1.peerStore.patch(node2.peerId, {
  multiaddrs: node2.getMultiaddrs()
})
```

You may notice that we are only adding `node2` to `node1` peer store. This is
because we want to dial up a bidirectional connection between these two nodes.

Finally, let's create protocols for `node1` & `node2` and dial those protocols.

```js
node1.handle('/node-1', ({ stream }) => {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    }
  )
})

node2.handle('/node-2', ({ stream }) => {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(uint8ArrayToString(msg.subarray()))
      }
    }
  )
})

// Dialing node2 from node1
const stream1 = await node1.dialProtocol(node2.peerId, ['/node-2'])
await pipe(
  [uint8ArrayFromString('from 1 to 2')],
  stream1
)

// Dialing node1 from node2
const stream2 = await node2.dialProtocol(node1.peerId, ['/node-1'])
await pipe(
  [uint8ArrayFromString('from 2 to 1')],
  stream2
)
```

If we run this code, the result should look like the following:

```Bash
> node 3.js
from 1 to 2
from 2 to 1
```

So, we have successfully set up a bidirectional connection with protocol muxing.
But you should be aware that we were able to dial from `node2` to `node1` even
we haven't added the `node1` peerId to node2 address book is because we dialed
node2 from node1 first. Then, we just dialed back our stream out from `node2` to
`node1`. So, if we dial from `node2` to `node1` before dialing from `node1` to
`node2` we will get an error.

The code below will result into an error as `the dial address is not valid`.

```js
// Dialing from node2 to node1
const stream2 = await node2.dialProtocol(node1.peerId, ['/node-1'])
await pipe(
  [uint8ArrayFromString('from 2 to 1')],
  stream2
)

// Dialing from node1 to node2
const stream1 = await node1.dialProtocol(node2.peerId, ['/node-2'])
await pipe(
  [uint8ArrayFromString('from 1 to 2')],
  stream1
)
```

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
