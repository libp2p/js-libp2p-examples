# @libp2p/example-delegated-routing-example <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> How to configure libp2p delegated routers

## Table of contents <!-- omit in toc -->

- [Running this example](#running-this-example)
  - [Finding Content Providers via the Delegate](#finding-content-providers-via-the-delegate)
  - [Finding Peers via the Delegate](#finding-peers-via-the-delegate)
- [License](#license)
- [Contribution](#contribution)

Delegated routing allows a libp2p node running in a constrained environment (for example a browser) to offload network operations and queries to a more capable node running elsewhere.

The [libp2p node](./src/libp2p.js) created by this app has no transports, connection encrypters or muxers - it uses only a [Delegated Routing V1 HTTP API client](https://specs.ipfs.tech/routing/http-routing-v1/) to look up CID providers and Peer Info from a more capable libp2p node running in a separate process.

## Running this example

1. Install the example dependencies
    ```console
    $ npm i
    ```
2. Start the Helia node in `./server.js` - this is the node we will delegate operations to
    ```console
    $ node ./server.js
    ```
3. Start the lightweight browser libp2p node
    ```console
    $ npm start
    ```

This should open your browser to <http://localhost:3000>. If it does not, go ahead and do that now.

### Finding Content Providers via the Delegate

1. Enter the CID of the block you wish to find providers for, one is pre-filled for your convenience
2. Click "Find Providers"
3. If any exist, provders will start to appear in the box beneath the input fields

### Finding Peers via the Delegate

1. Enter the PeerId of the peer you wish to find, one is pre-filled for your convenience
2. Click "Find PeerInfo"
3. If found, multiaddrs for the peer will appear in the box beneath the input fields

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
