'use strict'

// Libp2p Core
const { createLibp2p } = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')

// Create the Node
createLibp2p({
  modules: {
    transport: [ TCP, Websockets ]
  }
}, (err, libp2p) => {
  if (err) throw err

  // All done for now, exit
  process.exit(0)
})
