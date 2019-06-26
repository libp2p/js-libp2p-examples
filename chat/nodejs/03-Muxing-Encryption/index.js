'use strict'

// Libp2p Core
const { createLibp2p } = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const wrtc = require('wrtc')
// Multiaddr
const multiaddr = require('multiaddr')
// TODO: require `pull-mplex`
// TODO: require `libp2p-secio`

const webRTCStar = new WebRTCStar({ wrtc })

// Create the Node
createLibp2p({
  modules: {
    transport: [ TCP, Websockets, webRTCStar ],
    streamMuxer: [ /* TODO: add `pull-mplex` */ ],
    connEncryption: [ /* TODO: add `libp2p-secio` */ ]
  }
}, (err, libp2p) => {
  if (err) throw err

  // TODO: Listen on libp2p for `peer:connect` and log the provided PeerInfo.id.toB58String() peer id string.

  // Add a TCP listen address on port 0
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
  // Add a Websockets listen address on port 0
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')
  // Add the signaling server multiaddr to the peerInfo multiaddrs list
  libp2p.peerInfo.multiaddrs.add(`/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/p2p/${libp2p.peerInfo.id.toB58String()}`)

  // Start libp2p
  libp2p.start((err) => {
    if (err) throw err

    // Dial to the target peer
    const targetAddress = multiaddr('/ip4/127.0.0.1/tcp/63785/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d')
    libp2p.dial(targetAddress, (err) => {
      if (err) return console.error(err)
      // TODO: delete this log in favor of the `peer:connect` listener above
      console.info('Connected to target peer!')
    })
  })
})
