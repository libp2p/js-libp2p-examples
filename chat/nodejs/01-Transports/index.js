'use strict'
// TODO: require `libp2p-tcp`, `libp2p-websockets`, and `libp2p-webrtc-star`
// TODO: require `wrtc`

// Libp2p Core
const { createLibp2p } = require('libp2p')

// TODO: Create a new instance of `libp2p-webrtc-star`, and pass it { wrtc }

// Create the Node
createLibp2p({
  modules: {
    transport: [/* TODO: add `libp2p-tcp`, `libp2p-websockets`, and your `libp2p-webrtc-star` instance */]
  }
}, (err, libp2p) => {
  if (err) throw err

  // All done for now, exit
  process.exit(0)
})
