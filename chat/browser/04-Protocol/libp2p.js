// Libp2p Core
import Libp2p from 'libp2p'
// Transports
import Websockets from 'libp2p-websockets'
import filters from 'libp2p-websockets/src/filters'
import WebrtcStar from 'libp2p-webrtc-star'
// Multiaddr creation
import multiaddr from 'multiaddr'
// Stream Muxer
import Mplex from 'libp2p-mplex'
// Connection Encryption
import { NOISE } from 'libp2p-noise'

const transportKey = Websockets.prototype[Symbol.toStringTag]

const createLibp2p = async (peerId) => {
  // Create the Node
  const libp2p = await Libp2p.create({
    peerId,
    addresses: {
      listen: [
        // Add the signaling server multiaddr
        '/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star'
      ]
    },
    modules: {
      transport: [Websockets, WebrtcStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE]
    },
    config: {
      transport: {
        [transportKey]: {
          // by default websockets do not allow localhost dials
          // let's enable it for testing purposes in this example
          filter: filters.all
        }
      }
    }
  })

  // Listener for peer connection events
  libp2p.connectionManager.on('peer:connect', (connection) => {
    console.info(`Connected to ${connection.remotePeer.toB58String()}!`)
  })

  // Automatically start libp2p
  await libp2p.start()

  // Create the multiaddr to the Bootstrap node
  const targetAddress = multiaddr('/ip4/127.0.0.1/tcp/63786/ws/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d')
  // And dial it. The UI is listening for connections,
  // so it should update if the dial is successful.
  try {
    await libp2p.dial(targetAddress)
  } catch (err) {
    console.error(err)
  }

  return libp2p
}

export default createLibp2p
