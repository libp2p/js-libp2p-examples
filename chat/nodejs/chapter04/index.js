'use strict'

// Libp2p Core
const Libp2p = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
// Stream Muxer
const Mplex = require('pull-mplex')
// Connection Encryption
const Secio = require('libp2p-secio')

// PeerInfo, required when creating a libp2p instance
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')

// Generate our PeerInfo
PeerInfo.create((err, peerInfo) => {
  if (err) throw err

  // Wildcard listen on TCP and Websocket
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')

  // Create the node
  const libp2p = new Libp2p({
    peerInfo,
    modules: {
      transport: [ TCP, Websockets ],
      streamMuxer: [ Mplex ],
      connEncryption: [ Secio ]
    }
  })

  // Listener for peer connection events
  libp2p.on('peer:connect', (peerInfo) => {
    console.info(`Connected to ${peerInfo.id.toB58String()}!`)
  })

  // Start libp2p
  libp2p.start((err) => {
    if (err) throw err

    // Dial to the target peer
    const targetAddress = multiaddr('/ip4/127.0.0.1/tcp/63785/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d')
    libp2p.dial(targetAddress, (err) => {
      if (err) return console.error(err)
    })
  })
})
