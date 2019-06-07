'use strict'

// Libp2p Core
const { createLibp2p } = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')

const multiaddr = require('multiaddr')

// Create the Node
createLibp2p({
  modules: {
    transport: [ TCP, Websockets ]
  }
}, (err, libp2p) => {
  if (err) throw err

  // Wildcard listen on TCP and Websocket
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')

  // Start libp2p
  libp2p.start((err) => {
    if (err) throw err

    // Dial to the target peer
    const targetAddress = multiaddr('/ip4/127.0.0.1/tcp/63785/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d')
    libp2p.dial(targetAddress, (err) => {
      if (err) return console.error(err)
      console.info('Connected to target peer!')
    })
  })
})
