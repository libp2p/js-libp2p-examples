# @libp2p/example-webrtc-private-to-private

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

In libp2p terms a "private" node is one behind a [NAT firewall](https://en.wikipedia.org/wiki/Network_address_translation) that prevents it from being dialed externally.

This could be a browser, a node.js process or something else.

Nodes that support the [libp2p WebRTC transport](https://github.com/libp2p/specs/blob/master/webrtc/webrtc.md) such as browsers can by dialed via this method even if they are behind a NAT.

When establishing a WebRTC connection, the two browsers must first exchange a series of messages that establish the required capabilities of the nodes (we only require RTC data channels, no video or audio), and their internet-facing addresses/ports.

This is referred to as the "SDP handshake". The WebRTC spec requires this to take place out-of-band, so libp2p performs the handshake via a [Circuit Relay Server](https://docs.libp2p.io/concepts/nat/circuit-relay/) - this is another network node that has made some resources available for the good of the network.

When two browsers dial each other the following steps occur:

1. The listener makes a reservation on a relay with a free slot
2. The dialer obtains the listener's relay address
3. The dialer dials the relay and specifies the listeners PeerId as part of the Circuit Relay HOP protocol
4. The relay opens a stream on the listener as part of the Circuit Relay STOP protocol
5. A virtual connection is created between the dialer and the listener via the relay
6. The dialer opens a stream on the virtual connection to perform the SDP handshake
7. SDP messages are exchanged
8. A direct WebRTC connection is opened between the two browsers

At this point the browsers are directly connected and the relay plays no further part.

## Running the Example

### Build the `@libp2p/example-webrtc-private-to-private` package

Build example by calling `npm i && npm run build` in the repository root.

### Running the Relay Server

For browsers to communicate, we first need to run a relay server:

```shell
npm run relay
```

The [multiaddress](https://docs.libp2p.io/concepts/fundamentals/addressing/) the relay is listening on will be printed to the console. Copy one of them to your clipboard.

### Running the Clients

In a separate console tab, start the web server:

```shell
npm start
```

A browser window will automatically open.  Let's call this `Browser A`.

Using the copied multiaddrs from the relay server, paste it into the `Remote MultiAddress` input and click the `Connect` button.
`Browser A` is now connected to the relay server.

Copy the multiaddr located after the `Listening on` message.

Now open a second tab with the url `http://localhost:5173/`, perhaps in a different browser or a private window.  Let's call this `Browser B`.

Using the copied multiaddress from `Listening on` section in `Browser A`, paste it into the `Remote MultiAddress` input and click the `Connect` button.

The peers are now connected to each other.

Enter a message and click the `Send` button in either/both browsers and see the echo'd messages.

The output should look like:

`Browser A`
```text
Dialing '/ip4/127.0.0.1/tcp/57708/ws/p2p/12D3KooWRqAUEzPwKMoGstpfJVqr3aoinwKVPu4DLo9nQncbnuLk'
Listening on /ip4/127.0.0.1/tcp/57708/ws/p2p/12D3KooWRqAUEzPwKMoGstpfJVqr3aoinwKVPu4DLo9nQncbnuLk/p2p-circuit/p2p/12D3KooW9wFiWFELqGJTbzEwtByXsPiHJdHB8n7Kin71VMYyERmC/p2p-circuit/webrtc/p2p/12D3KooW9wFiWFELqGJTbzEwtByXsPiHJdHB8n7Kin71VMYyERmC
Dialing '/ip4/127.0.0.1/tcp/57708/ws/p2p/12D3KooWRqAUEzPwKMoGstpfJVqr3aoinwKVPu4DLo9nQncbnuLk/p2p-circuit/p2p/12D3KooWBZyVLJfQkofqLK4op9TPkHuUumCZt1ybQrPvNm7TVQV9/p2p-circuit/webrtc/p2p/12D3KooWBZyVLJfQkofqLK4op9TPkHuUumCZt1ybQrPvNm7TVQV9'
Sending message 'helloa'
Received message 'helloa'
Received message 'hellob'
```

`Browser B`
```text
Dialing '/ip4/127.0.0.1/tcp/57708/ws/p2p/12D3KooWRqAUEzPwKMoGstpfJVqr3aoinwKVPu4DLo9nQncbnuLk/p2p-circuit/p2p/12D3KooW9wFiWFELqGJTbzEwtByXsPiHJdHB8n7Kin71VMYyERmC/p2p-circuit/webrtc/p2p/12D3KooW9wFiWFELqGJTbzEwtByXsPiHJdHB8n7Kin71VMYyERmC'
Listening on /ip4/127.0.0.1/tcp/57708/ws/p2p/12D3KooWRqAUEzPwKMoGstpfJVqr3aoinwKVPu4DLo9nQncbnuLk/p2p-circuit/p2p/12D3KooWBZyVLJfQkofqLK4op9TPkHuUumCZt1ybQrPvNm7TVQV9/p2p-circuit/webrtc/p2p/12D3KooWBZyVLJfQkofqLK4op9TPkHuUumCZt1ybQrPvNm7TVQV9
Received message 'helloa'
Sending message 'hellob'
Received message 'hellob'
```

## Next steps

The WebRTC transport is not limited to browsers.

Why don't you try to create a Node.js version of the [browser peer script](./index.js)?

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

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
