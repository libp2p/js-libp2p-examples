# @libp2p/example-webrtc-browser-to-server

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

This example leverages the [vite bundler](https://vitejs.dev/) to compile and serve the libp2p code in the browser. You can use other bundlers such as Webpack, but we will not be covering them here.

## Running the Server

To run the Go LibP2P WebRTC server:

```console
npm run server
```

Copy the multiaddress from the output.

## Running the Example

In a separate console tab, install dependencies and start the Vite server:

```shell
npm i && npm run start
```

The browser window will automatically open.
Using the copied multiaddress from the Go server, paste it into the `Server MultiAddress` input and click the `Connect` button.
Once the peer is connected, click the message section will appear.  Enter a message and click the `Send` button.

The output should look like:

```text
Dialing /ip4/10.0.1.5/udp/54375/webrtc/certhash/uEiADy8JubdWrAzseyzfXFyCpdRN02eWZg86tjCrTCA5dbQ/p2p/12D3KooWEG7N4bnZfFBNZE7WG6xm2P4Sr6sonMwyD4HCAqApEthb
Peer connected '/ip4/10.0.1.5/udp/54375/webrtc/certhash/uEiADy8JubdWrAzseyzfXFyCpdRN02eWZg86tjCrTCA5dbQ/p2p/12D3KooWEG7N4bnZfFBNZE7WG6xm2P4Sr6sonMwyD4HCAqApEthb'
Sending message 'hello'
Received message 'hello'
```

## Need help?

- Read the [js-libp2p documentation](https://github.com/libp2p/js-libp2p/tree/main/doc)
- Check out the [js-libp2p API docs](https://libp2p.github.io/js-libp2p/)
- Check out the [general libp2p documentation](https://docs.libp2p.io) for tips, how-tos and more
- Read the [libp2p specs](https://github.com/libp2p/specs)
- Ask a question on the [js-libp2p discussion board](https://github.com/libp2p/js-libp2p/discussions)
