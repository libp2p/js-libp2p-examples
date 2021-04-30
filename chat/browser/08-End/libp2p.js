// Libp2p Core
import Libp2p from 'libp2p'
// Transports
import Websockets from 'libp2p-websockets'
import filters from 'libp2p-websockets/src/filters'
import WebrtcStar from 'libp2p-webrtc-star'
// Stream Muxer
import Mplex from 'libp2p-mplex'
// Connection Encryption
import { NOISE } from 'libp2p-noise'
// Peer Discovery
import Bootstrap from 'libp2p-bootstrap'
import KadDHT from 'libp2p-kad-dht'
// Gossipsub
import Gossipsub from 'libp2p-gossipsub'

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
      connEncryption: [NOISE],
      peerDiscovery: [Bootstrap],
      dht: KadDHT,
      pubsub: Gossipsub
    },
    config: {
      peerDiscovery: {
        bootstrap: {
          list: ['/ip4/127.0.0.1/tcp/63786/ws/p2p/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d']
        }
      },
      dht: {
        enabled: true,
        randomWalk: {
          enabled: true
        }
      },
      transport: {
        [transportKey]: {
          // by default websockets do not allow localhost dials
          // let's enable it for testing purposes in this example
          filter: filters.all
        }
      }
    }
  })

  // Automatically start libp2p
  await libp2p.start()

  return libp2p
}

export default createLibp2p
