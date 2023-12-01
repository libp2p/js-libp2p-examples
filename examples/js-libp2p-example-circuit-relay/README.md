# @libp2p/example-circuit-relay <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> Shows how to configure relayed connections

## Table of contents <!-- omit in toc -->

- [0. Setup the example](#0-setup-the-example)
- [1. Set up a relay node](#1-set-up-a-relay-node)
- [2. Set up a listener node with `discoverRelays` Enabled](#2-set-up-a-listener-node-with-discoverrelays-enabled)
- [3. Set up a dialer node for testing connectivity](#3-set-up-a-dialer-node-for-testing-connectivity)
- [4. What is next?](#4-what-is-next)
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
    // announce: ['/dns4/auto-relay.libp2p.io/tcp/443/wss/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3']
  },
  transports: [
    webSockets()
  ],
  connectionEncryption: [
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

## 2. Set up a listener node with `discoverRelays` Enabled

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
  transports: [
    webSockets(),
    circuitRelayTransport({
      discoverRelays: 2
    })
  ],
  connectionEncryption: [
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

You should now run the following to start the node running Auto Relay:

```sh
node listener.js /ip4/192.168.1.120/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3
```

This should print out something similar to the following:

```sh
Node started with id QmerrWofKF358JE6gv3z74cEAyL7z1KqhuUoVfGEynqjRm
Connected to the HOP relay QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3
Advertising with a relay address of /ip4/192.168.1.120/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3/p2p-circuit/p2p/QmerrWofKF358JE6gv3z74cEAyL7z1KqhuUoVfGEynqjRm
```

Per the address, it is possible to verify that the auto relay node is listening
on the circuit relay node address.

Instead of dialing this relay manually, you could set up this node with the
Bootstrap module and provide it in the bootstrap list. Moreover, you can use
other `peer-discovery` modules to discover peers in the network and the node
will automatically bind to the relays that support HOP until reaching the
maximum number of listeners.

## 3. Set up a dialer node for testing connectivity

Now that you have a relay node and a node bound to that relay, you can test
connecting to the auto relay node via the relay.

```js
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux',

const autoRelayNodeAddr = process.argv[2]
if (!autoRelayNodeAddr) {
  throw new Error('the auto relay node address needs to be specified')
}

const node = await createLibp2p({
  transports: [webSockets()],
  connectionEncryption: [noise()],
  streamMuxers: [yamux(), mplex()]
})

console.log(`Node started with id ${node.peerId.toString()}`)

const conn = await node.dial(autoRelayNodeAddr)
console.log(`Connected to the auto relay node via ${conn.remoteAddr.toString()}`)
```

You should now run the following to start the relay node using the listen
address from step 2:

```sh
node dialer.js /ip4/192.168.1.120/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3
```

Once you start your test node, it should print out something similar to the
following:

```sh
Node started: Qme7iEzDxFoFhhkrsrkHkMnM11aPYjysaehP4NZeUfVMKG
Connected to the auto relay node via /ip4/192.168.1.120/tcp/61592/ws/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3/p2p-circuit/p2p/QmerrWofKF358JE6gv3z74cEAyL7z1KqhuUoVfGEynqjRm
```

As you can see from the output, the remote address of the established connection
uses the relayed connection.

## 4. What is next?

Before moving into production, there are a few things that you should take into
account.

A relay node should not advertise its private address in a real world scenario,
as the node would not be reachable by others. You should provide an array of
public addresses in the libp2p `addresses.announce` option. If you are using
websockets, bear in mind that due to browser’s security policies you cannot
establish unencrypted connection from secure context. The simplest solution is
to setup SSL with nginx and proxy to the node and setup a domain name for the
certificate.

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall
be dual licensed as above, without any additional terms or conditions.
