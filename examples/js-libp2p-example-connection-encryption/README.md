# @libp2p/example-connection-encryption <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> An example of how to configure connection encrypters

## Table of contents <!-- omit in toc -->

- [Set up encrypted communications](#set-up-encrypted-communications)
- [License](#license)
- [Contribution](#contribution)

All traffic sent over connections between two libp2p nodes is encrypted. This gives us peace of mind that the node we are talking to is the node we think we are talking to, and that no-one is able to eavesdrop or interfere with the data we are exchanging.

You may have noticed that every time we dial the [multiaddr](https://multiformats.io/multiaddr) of a peer in libp2p space, we include the [PeerId](https://docs.libp2p.io/concepts/fundamentals/peers/#peer-id) at the end:

```
/ip4/127.0.0.1/tcp/89765/p2p/12D3Foo
```

For some types of `PeerID`, it is the public key of the remote node (Ed25519 and secp256k1) or, when the public key is too large to embed in a string, it can be the a hash of the public key (RSA).

Including the `PeerID` in the multiaddr allows us to authenticate the remote peer by creating a crypto challenge that allows them to prove they hold the the private key that matches the public key we know.

Once authenticated in this fashion we can proceed to encrypt/decrypt all traffic sent over the connection.

There are several strategies for performing encryption, the most common uses the [Noise Protocol Framework](http://www.noiseprotocol.org/).

js-libp2p also supports a plaintext "encryption" implementation that should not be used in production but is sometimes useful for testing.

## Set up encrypted communications

To add them to your libp2p configuration, all you have to do is:

```JavaScript
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'

const createNode = async () => {
  return await createLibp2p({
    transports: [ tcp() ],
    streamMuxers: [ yamux() ],
    // Attach noise as the crypto channel to use
    conectionEncrypters: [ noise() ]
  })
}
```

And that's it, from now on, all your libp2p communications are encrypted. Try running the example [noise.js](./noise.js) to see it working.

To experiment with the plaintext implementation, run [plaintext.js](./plaintext.js).

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
