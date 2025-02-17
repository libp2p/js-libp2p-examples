# @libp2p/example-circuit-relay <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> Shows how to configure relayed connections

## Table of contents <!-- omit in toc -->

- [0. Setup the example](#0-setup-the-example)
- [1. Set up a relay node](#1-set-up-a-relay-node)
- [2. Set up a listener node with a circuit relay address](#2-set-up-a-listener-node-with-a-circuit-relay-address)
- [3. Set up a dialer node for testing connectivity](#3-set-up-a-dialer-node-for-testing-connectivity)
- [4. What is next?](#4-what-is-next)
- [Need help?](#need-help)
- [License](#license)
- [Contribution](#contribution)

## 0. Setup the example

First of all run `npm install` in the example folder. This will install all
required dependencies and you'll be ready to go.

This example comes with 3 main files. A `relay.js` file to be used in the first
step, a `listener.js` file to be used in the second step and a `dialer.js` file
to be used on the third step. All of these scripts will run their own libp2p
node, which will interact with the previous ones. All nodes must be running in
order for you to proceed.

## 1. Set up a relay node

In the first step of this example, we need to configure and run a relay node in
order for our target node to bind to for accepting inbound connections.

The relay node will need to have a relay service added which will allow a
limited number of remote peers to make relay reservations with it.

It can be configured as follows:

```js
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import { createLibp2p } from 'libp2p'

const node = await createLibp2p({
  addresses: {
    listen: ['/ip4/0.0.0.0/tcp/0/ws']
    // TODO check "What is next?" section
  },
  transports: [
    webSockets()
  ],
  connectionEncrypters: [
    noise()
  ],
  streamMuxers: [
    yamux()
  ],
  services: {
    identify: identify(),
    relay: circuitRelayServer()
  }
})

console.log(`Node started with id ${node.peerId.toString()}`)
console.log('Listening on:')
node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
```

You should now run the following to start the relay node:

```sh
node relay.js
```

This should print out something similar to the following:

```sh
Node started with id QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3
Listening on:
/ip4/127.0.0.1/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3
/ip4/192.168.1.120/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3
```

## 2. Set up a listener node with a circuit relay address

One of the typical use cases for Circuit Relay is nodes behind a NAT or browser
nodes due to their inability to expose a public address.

For running a libp2p node that automatically discovers available relays, you can
see the following:

```js
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import { multiaddr } from '@multiformats/multiaddr'
import { createLibp2p } from 'libp2p'

const relayAddr = process.argv[2]
if (!relayAddr) {
  throw new Error('the relay address needs to be specified as a parameter')
}

const node = await createLibp2p({
  addresses: {
    listen: [
      '/p2p-circuit'
    ]
  },
  transports: [
    webSockets(),
    circuitRelayTransport()
  ],
  connectionEncrypters: [
    noise()
  ],
  streamMuxers: [
    yamux()
  ],
  services: {
    identify: identify()
  }
})

console.log(`Node started with id ${node.peerId.toString()}`)

const conn = await node.dial(relayAddr)

console.log(`Connected to the relay ${conn.remotePeer.toString()}`)

// Wait for connection and relay to be bind for the example purpose
node.addEventListener('self:peer:update', (evt) => {
  // Updated self multiaddrs?
  console.log(`Advertising with a relay address of ${node.getMultiaddrs()[0].toString()}`)
})
```

As you can see in the code, we need to provide the relay address, `relayAddr`,
as a process argument. This node will dial the provided relay address and
automatically bind to it.

You should now run the following to start the listener and see it automatically
acquire a circuit relay address:

```sh
node listener.js /ip4/192.168.1.120/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3
```

This should print out something similar to the following:

```sh
Node started with id QmerrWofKF358JE6gv3z74cEAyL7z1KqhuUoVfGEynqjRm
Connected to the HOP relay QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3
Listening on a relay address of /ip4/192.168.1.120/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3/p2p-circuit/p2p/QmerrWofKF358JE6gv3z74cEAyL7z1KqhuUoVfGEynqjRm
```

Per the listening address, it is possible to verify that the listener node is
indeed listening on the circuit relay node address.

Instead of dialing this relay manually, you could set up this node with the
`@libp2p/bootstrap` module and provide it in the bootstrap list.

Alternatively, you can use other `peer-discovery` modules such as
`@libp2p/kad-dht` which allow your node to perform a random walk of the network
to discover peers running the Circuit Relay HOP protocol and the node will
automatically bind to these relays until reaching the maximum number of
listeners defined by how many `/p2p-circuit` entries in the `address.listen`
array (usually one is sufficient).

## 3. Set up a dialer node for testing connectivity

Now that you have a relay node and a node bound to that relay, you can test
connecting to the listening node via the relay.

```js
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { multiaddr } from '@multiformats/multiaddr'

const listenNodeAddr = process.argv[2]
if (!listenNodeAddr) {
  throw new Error('The listening node address needs to be specified')
}

const node = await createLibp2p({
  transports: [webSockets()],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()]
})

console.log(`Node started with id ${node.peerId.toString()}`)

const ma = multiaddr(listenNodeAddr)
const conn = await node.dial(ma, {
  signal: AbortSignal.timeout(10_000)
})
console.log(`Connected to the listen node via ${conn.remoteAddr.toString()}`)
```

You should now run the following to start the relay node using the listen
address from step 2:

```sh
node dialer.js /ip4/192.168.1.120/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3/p2p-circuit/p2p/QmerrWofKF358JE6gv3z74cEAyL7z1KqhuUoVfGEynqjRm
```

Once you start your test node, it should print out something similar to the
following:

```sh
Node started: Qme7iEzDxFoFhhkrsrkHkMnM11aPYjysaehP4NZeUfVMKG
Connected to the listening node via /ip4/192.168.1.120/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3/p2p-circuit/p2p/QmerrWofKF358JE6gv3z74cEAyL7z1KqhuUoVfGEynqjRm
```

As you can see from the output, the remote address of the established connection
uses the relayed connection.

## 4. What is next?

Before moving into production, there are a few things that you should take into
account.

A relay node should not advertise its private address in a real world scenario,
as the node would not be reachable by others.

If you are using websockets, bear in mind that due to browser’s security
policies you cannot establish unencrypted connection from secure context.

One solution is to setup TLS with nginx and proxy to the node and setup
a domain name for the certificate. You can then provide an list of public
addresses in the libp2p `addresses.announce` config option.

Alternatively you can use the public [AutoTLS service](https://blog.libp2p.io/autotls/)
(provided by [Interplanetary Shipyard](https://blog.ipfs.tech/shipyard-hello-world/))
to automatically provision a TLS certificate and accompanying domain name - see
the [js-libp2p-example-auto-tls](https://github.com/libp2p/js-libp2p-example-auto-tls)
for more information.

## Need help?

- Read the [js-libp2p documentation](https://github.com/libp2p/js-libp2p/tree/main/doc)
- Check out the [js-libp2p API docs](https://libp2p.github.io/js-libp2p/)
- Check out the [general libp2p documentation](https://docs.libp2p.io) for tips, how-tos and more
- Read the [libp2p specs](https://github.com/libp2p/specs)
- Ask a question on the [js-libp2p discussion board](https://github.com/libp2p/js-libp2p/discussions)

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall
be dual licensed as above, without any additional terms or conditions.
