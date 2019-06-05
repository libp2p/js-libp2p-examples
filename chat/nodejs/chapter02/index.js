'use strict'

// Libp2p Core
const Libp2p = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')

// PeerInfo, required when creating a libp2p instance
const PeerInfo = require('peer-info')

// Generate our PeerInfo
PeerInfo.create((err, peerInfo) => {
  if (err) throw err

  // Create the node
  new Libp2p({
    peerInfo,
    modules: {
      transport: [ TCP, Websockets ]
    }
  })

  // All done for now, exit
  process.exit(0)
})
