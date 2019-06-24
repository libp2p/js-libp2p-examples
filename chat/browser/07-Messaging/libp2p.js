// Libp2p Core
import Libp2p from 'libp2p'
// Transports
import Websockets from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'
// Stream Muxer
import Mplex from 'pull-mplex'
// Connection Encryption
import Secio from 'libp2p-secio'
// Peer Discovery
import Bootstrap from 'libp2p-bootstrap'
import KadDHT from 'libp2p-kad-dht'

const createLibp2p = (peerInfo) => {
  // Listen on the signaling server
  peerInfo.multiaddrs.add(`/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/p2p/${peerInfo.id.toB58String()}`)

  // Create webrtcStar here, so we can pass `webrtcStar.discovery`
  // to the peerDiscovery configuration
  const webrtcStar = new WebrtcStar()

  // Create the Node
  const libp2p = new Libp2p({
    peerInfo,
    modules: {
      transport: [ Websockets, webrtcStar ],
      streamMuxer: [ Mplex ],
      connEncryption: [ Secio ],
      peerDiscovery: [ Bootstrap, webrtcStar.discovery ],
      dht: KadDHT
    },
    config: {
      peerDiscovery: {
        bootstrap: {
          list: [ '/ip4/127.0.0.1/tcp/63786/ws/p2p/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d' ]
        }
      },
      dht: {
        enabled: true,
        randomWalk: {
          enabled: true
        }
      },
      EXPERIMENTAL: {
        pubsub: true
      }
    }
  })

  // Automatically start libp2p
  libp2p.start((err) => {
    if (err) throw err
  })

  return libp2p
}

export default createLibp2p
