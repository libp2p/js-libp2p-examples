'use strict'

// Libp2p Core
const { createLibp2p } = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const wrtc = require('wrtc')

const webRTCStar = new WebRTCStar({ wrtc })

// Create the Node
createLibp2p({
  modules: {
    transport: [ TCP, Websockets, webRTCStar ]
  }
}, (err, libp2p) => {
  if (err) throw err

  // TODO: Add a TCP listen address on port 0
  // TODO: Add a Websockets listen address on port 0
  // TODO: Add the signaling server multiaddr to the peerInfo multiaddrs list

  // TODO: remove the exit call
  process.exit(0)

  // TODO: start libp2p, if there is an error in the callback throw it
  // TODO: once started, use `libp2p.dial` to dial to the Bootstrap node
})
