'use strict'
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')

// WebRTC support in Node.js
const wrtc = require('wrtc')

// Multiaddr
const multiaddr = require('multiaddr')

// Stream Multiplexers
// TODO: require `libp2p-mplex`

// Connection Encryption
// TODO: require `libp2p-noise`
// TODO: require `libp2p-secio`

// Libp2p Core
const Libp2p = require('libp2p')

async function main() {
  // Create the Node
  const libp2p = await Libp2p.create({
    addresses: {
      listen: [
        // Add a TCP listen address on port 0
        '/ip4/0.0.0.0/tcp/0',
        // Add a Websockets listen address on port 0
        '/ip4/0.0.0.0/tcp/0/ws',
        // Add the signaling server multiaddr
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
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

  // TODO: Listen on libp2p for `peer:connect` and log the provided connection.remotePeer.toB58String() peer id string.

  // start libp2p
  await libp2p.start()
  // once started, use `libp2p.dial` to dial to the Bootstrap node
  const targetAddress = multiaddr('/dnsaddr/sjc-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN')
  try {
    await libp2p.dial(targetAddress)
    // TODO: delete this log in favor of the `peer:connect` listener above
    console.info('Connected to target peer!')
  } catch (err) {
    console.error(err)
  }
}

main()
