'use strict'
// require `libp2p-tcp`, `libp2p-websockets`, and `libp2p-webrtc-star`
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
// require `wrtc`
const wrtc = require('wrtc')
// Multiaddr
const multiaddr = require('multiaddr')
// TODO: require `libp2p-mplex`
// TODO: require `libp2p-noise`
// TODO: require `libp2p-secio`

// Libp2p Core
const Libp2p = require('libp2p')

;(async () => {
  // Create the Node
  const libp2p = await Libp2p.create({
    addresses: {
      listen: [
        // Add a TCP listen address on port 0
        '/ip4/0.0.0.0/tcp/0',
        // Add a Websockets listen address on port 0
        '/ip4/0.0.0.0/tcp/0/ws',
        // Add the signaling server multiaddr to the peerInfo multiaddrs list
        `/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/`
      ]
    },
    modules: {
      transport: [ TCP, Websockets, WebRTCStar ],
      streamMuxer: [ /* TODO: add `libp2p-mplex` */ ],
      connEncryption: [ /* TODO: add `libp2p-noise` and `libp2p-secio` */ ]
    },
    config: {
      transport : {
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc
        }
      }
    }
  })

  // TODO: Listen on libp2p for `peer:connect` and log the provided PeerInfo.id.toB58String() peer id string.

  // start libp2p
  await libp2p.start()
  // once started, use `libp2p.dial` to dial to the Bootstrap node
  const targetAddress = multiaddr('/ip4/127.0.0.1/tcp/63785/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d')
  try {
    await libp2p.dial(targetAddress)
    // TODO: delete this log in favor of the `peer:connect` listener above
    console.info('Connected to target peer!')
  } catch (err) {
    console.error(err)
  }
})()
