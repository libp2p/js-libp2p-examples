# @libp2p/example-discovery-mechanisms <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> How to configure peer discovery mechanisms

## Table of contents <!-- omit in toc -->

- [1. Find peers on the Amino DHT](#1-find-peers-on-the-amino-dht)
- [2. Using MulticastDNS to find other peers on the same network](#2-using-multicastdns-to-find-other-peers-on-the-same-network)
- [3. Pubsub based Peer Discovery](#3-pubsub-based-peer-discovery)
- [4. Where to find other Peer Discovery Mechanisms](#4-where-to-find-other-peer-discovery-mechanisms)
- [License](#license)
- [Contribution](#contribution)

With this system, a libp2p node can both have a set of nodes to always connect on boot (bootstraper nodes), discover nodes through locality (e.g connected in the same LAN) or through serendipity (random walks on a DHT).

These mechanisms save configuration and enable a node to operate without any explicit dials, it will just work. Once new peers are discovered, their known data is stored in the peer's PeerStore.

## 1. Find peers on the Amino DHT

The [IPFS DHT](https://blog.ipfs.tech/2023-09-amino-refactoring/), "Amino" is a network of peers that all speak a [variation](https://github.com/libp2p/specs/blob/master/kad-dht/README.md) of the [Kademlia](https://en.wikipedia.org/wiki/Kademlia) protocol.

Kademlia works on the principal of "closeness" - this is not geographic or latency based, instead:

1. Given two nodes A and B, and some target data
2. Calculate the hash of the [PeerID](https://docs.libp2p.io/concepts/fundamentals/peers/#peer-id) of each node, and the hash of the target data
3. XOR each PeerID hash together with the data hash
4. We can say that A is closer than B if the numeric result of the XOR calculation is lower

When your node connects to the DHT, the first thing it will do is run a "self-query". During this query it asks connected peers for the peers they know that are closer to your node's PeerID.  It will repeat this query until it finds the 20 closest nodes on the network.

During this query, every peer it traverses through is a peer discovery!

To run the demo, take a look a [1-dht.js](./1-dht.js). In this demo we use the `@libp2p/bootstrap` module to connect to a list of bootstrap peers - these peers allow us to make our "self-query".

Once peers are discovered, they will be dialed due to libp2p's auto-dialer which attempts to increase the number of connections a node has..

From running [1-dht.js](./1-dht.js), you should see the following:

```console
> node 1-dht.js
Discovered: QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ
Discovered: QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN
Discovered: QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb
Discovered: QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp
Discovered: QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa
Discovered: QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt
Connection established to: QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb
Discovered: 12D3KooWNUHA7Upmvcfk4GUz5orpQKrnbTFDofsNL95rUX7g2nzX
Discovered: 12D3KooWGJvA6di2KL2YezPVNdUp6fuC2ZbdngNBGvwhgKPcQYf2
Discovered: 12D3KooWK8bRNVA5bWVpixTVSAP6oLkXTsVBo5Et91S846wpK6xW
Discovered: 12D3KooWMn8cJNsPMAw9jif9CHzom7so3usSHRdkQsPfcS9x9Prt
Discovered: Qmeau5xZPEciw3Kw8FFsufkkjWoBYjNoxxNcLx93rABY56
Discovered: 12D3KooWHgohc8QPpJXRW8mEm1vgvnh6AQKU1bwSRuLEMYMvPahA
Discovered: 12D3KooWMBbpduEtVHbKTiBcjLQpV2Tj3QRJD3zGFKctFuAhkgMd
... lots more output
```

## 2. Using MulticastDNS to find other peers on the same network

[mDNS](https://en.wikipedia.org/wiki/Multicast_DNS) is a mechanism for device and peer discovery on the local network.

For this example, we need `@libp2p/mdns`, go ahead and `npm install` it. You can find the complete solution at [2-mdns.js](./2-mdns.js).

Update your libp2p configuration to include MulticastDNS.

```JavaScript
import { createLibp2p } from 'libp2p'
import { mdns } from '@libp2p/mdns'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { noise } from '@chainsafe/libp2p-noise'

const createNode = () => {
  return createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [
      tcp()
    ],
    streamMuxers: [
      yamux(),mplex()
    ],
    connectionEncryption: [
      noise()
    ],
    peerDiscovery: [
      mdns({
        interval: 20e3
      })
    ]
  })
}
```

To observe it working, spawn two nodes.

```JavaScript
const [node1, node2] = await Promise.all([
  createNode(),
  createNode()
])

node1.addEventListener('peer:discovery', (evt) => console.log('Discovered:', evt.detail.id.toString()))
node2.addEventListener('peer:discovery', (evt) => console.log('Discovered:', evt.detail.id.toString()))
```

If you run this example, you will see the other peers being discovered.

```bash
> node 2.js
Discovered: QmSSbQpuKrxkoXHm1v4Pi35hPN5hUHMZoBoawEs2Nhvi8m
Discovered: QmRcXXhtG8vTqwVBRonKWtV4ovDoC1Fe56WYtcrw694eiJ
```

## 3. Pubsub based Peer Discovery

For this example, we need [`@libp2p/pubsub-peer-discovery`](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/), go ahead and `npm install` it. It is a module that has the local node subscribe to a known pub/sub topic and to broadcast it's peer info on the topic periodically.

Pub/sub based peer discovery is useful for deployments where other mechanisms may not be suitable - for example in browsers which do not support transports which make up the majority of nodes on the DHT (e.g. TCP or QUIC).

You can find the complete solution at [3-pubsub.js](./3-pubsub.js).

In the example we create three nodes.  The first is used to bootstrap the network.  The second and third dial the bootstrapper, then discover each other via the pub/sub peer discovery topic.

## 4. Where to find other Peer Discovery Mechanisms

There are plenty more Peer Discovery Mechanisms out there, you can:

- Any DHT will offer you a discovery capability. You can simple *random-walk* the routing tables to find other peers to connect to. For example [@libp2p/kad-dht](https://github.com/libp2p/js-libp2p/tree/master/packages/kad-dht) can be used for peer discovery. An example of how to configure it to enable random walks can be found [here](https://github.com/libp2p/js-libp2p/blob/v0.28.4/doc/CONFIGURATION.md#customizing-dht).
- You can create your own Discovery service, a registry, a list, a radio beacon, you name it!

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
