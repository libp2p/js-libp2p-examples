'use strict'
// TODO: require `libp2p-tcp`, `libp2p-websockets`, and `libp2p-webrtc-star`
// TODO: require `wrtc`

// Libp2p Core
const Libp2p = require('libp2p')

async function main () {
  // Create the Node
  const libp2p = await Libp2p.create({
    modules: {
      transport: [/* TODO: add `libp2p-tcp`, `libp2p-websockets`, and your `libp2p-webrtc-star` instance */]
    },
    config: {
      transport : {
        // WebRTCStar should match the exported name of the `libp2p-webrtc-star` transport
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc
        }
      }
    }
  })
}

main()
