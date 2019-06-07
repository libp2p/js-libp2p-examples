'use strict'

// Libp2p Core
const { createLibp2p } = require('libp2p')

// Create the Node
createLibp2p({
  modules: {
    transport: []
  }
}, (err, libp2p) => {
  if (err) throw err

  // All done for now, exit
  process.exit(0)
})
