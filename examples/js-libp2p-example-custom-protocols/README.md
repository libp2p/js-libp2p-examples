# @libp2p/example-custom-protocols <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> How to create custom protocols for your app

## Table of contents <!-- omit in toc -->

- [Protocol streams](#protocol-streams)
  - [Echo](#echo)
  - [Request/response](#requestresponse)
    - [Message delimiting](#message-delimiting)
    - [Message formatting](#message-formatting)
    - [Putting it together](#putting-it-together)
  - [Next steps](#next-steps)
- [License](#license)
- [Contribution](#contribution)

## Protocol streams

Once you have located peers and opened a connection to them, the next thing to do is to send and receive data.

This is done using protocol streams which are full duplex streams (e.g. both ends can read and write) managed by libp2p.

The data protocol is up to the user, both ends will agree on some sort of format for the data sent/received and signal the agreement by using the same protocol id.

It is recommended that the protocol id contains a version number, but it is not enforced or used in any way so it's more of a signal to the developer.

```js
const remotePeer = peerIdFromString('QmFoo...')
const myProtocolId = '/hello/world/1.0.0'

const stream = await libp2p.dialProtocol(remotePeer, myProtocolId)
//... use stream
```

### Echo

An echo protocol is a simple example of a protocol stream that simply writes any received data back to the user.

You can find a complete example that you can run yourself in [1-echo.js](./1-echo.js)

```js
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
```

### Request/response

It's also possible to send/receive data in a pre-decided series of interactions - these are down to the protocol being followed.

Our request/response protocol will send a series of messages back and forth between the local and the remote node.

#### Message delimiting

Each message will be serialized to a `Uint8Array` before sending.

Something to consider here is that there is no guarantee a single write will result in a single read at the remote end so the local and remote must agree on a method of delimiting the data that will be transferred over the wire.

This is protocol specific but a common way to do it is to use [varint](https://protobuf.dev/programming-guides/encoding/#varints) prefixes for data.

This encodes the length of the following data in an efficient manner, so it looks like the following on the wire:

```
<data-length><data><data-length><data>...
```

#### Message formatting

The messages themselves need to be serialized/deserialized somehow. Again this needs to be agreed by both ends of the stream and is protocol specific.

A common way to do this is with [ProtoBuf](https://protobuf.dev/programming-guides/proto3/) encoding, but you could use [JSON](https://www.json.org/json-en.html) or [CBOR](https://cbor.io/) or whatever you like.

#### Putting it together

For our example we're going to use varint length prefixed JSON messages serialized as `Uint8Array`s.

You can find a complete example that you can run yourself in [2-request-response.js](./2-request-response.js)

```js
// this is our protocol id
const REQ_RESP_PROTOCOL = '/request-response/1.0.0'

await remote.handle(REQ_RESP_PROTOCOL, ({ stream }) => {
  Promise.resolve().then(async () => {
    // lpStream lets us read/write in a predetermined order
    const lp = lpStream(stream)

    // read the incoming request
    const req = await lp.read()

    // deserialize the query
    const query = JSON.parse(new TextDecoder().decode(req.subarray()))

    // handle the query
    // ... some code here

    // write the response
    await lp.write(new TextEncoder().encode(JSON.stringify({
      // ... some values here
    })))
  }
})

// the local will dial the remote on the protocol stream
const stream = await local.dialProtocol(remote.getMultiaddrs(), REQ_RESP_PROTOCOL)

// lpStream lets us read/write in a predetermined order
const lp = lpStream(stream)

// send the query
await lp.write(new TextEncoder().encode(JSON.stringify({
  // ... some values here
})))

// read the response
const res = await lp.read()
const output = JSON.parse(new TextDecoder().decode(res.subarray()))
```

### Next steps

To send more structured data, you can use [protons](https://www.npmjs.com/package/protons) to create protobuf definitions of your messages and [it-protobuf-stream](https://www.npmjs.com/package/it-protobuf-stream) to send them back and forth.

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
