'use strict'
// require `libp2p-tcp`, `libp2p-websockets`, and `libp2p-webrtc-star`
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
// require `wrtc`
const wrtc = require('wrtc')

// Libp2p Core
const Libp2p = require('libp2p')

;(async () => {
  // Create the Node
  const libp2p = await Libp2p.create({
    addresses: {
      // TODO: Add a TCP listen address on port 0
      // TODO: Add a Websockets listen address on port 0
      // TODO: Add the signaling server multiaddr
      listen: []
    },
    modules: {
      transport: [ TCP, Websockets, WebRTCStar ]
    },
    config: {
      transport : {
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc
        }
      }
    }
  })

  // TODO: remove the exit call
  process.exit(0)

  // TODO: start libp2p
  // TODO: once started, use `libp2p.dial` to dial to the Bootstrap node
})()
