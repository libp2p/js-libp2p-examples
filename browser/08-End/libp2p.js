// Libp2p Core
import Libp2p from 'libp2p'
// Transports
import Websockets from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'
// Stream Muxer
import Mplex from 'libp2p-mplex'
// Connection Encryption
import { NOISE } from 'libp2p-noise'
import Secio from 'libp2p-secio'
// Peer Discovery
import Bootstrap from 'libp2p-bootstrap'
import KadDHT from 'libp2p-kad-dht'
// Gossipsub
import Gossipsub from 'libp2p-gossipsub'

const createLibp2p = async (peerId) => {
  // Create the Node
  const libp2p = await Libp2p.create({
    peerId,
    addresses: {
      listen: [
        // Add the signaling server multiaddr
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
      ]
    },
    modules: {
      transport: [Websockets, WebrtcStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE, Secio],
      peerDiscovery: [Bootstrap],
      dht: KadDHT,
      pubsub: Gossipsub
    },
    config: {
      peerDiscovery: {
        bootstrap: {
          list: ['/dns4/sjc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN']
        }
      },
      dht: {
        enabled: true,
        randomWalk: {
          enabled: true
        }
      }
    }
  })

  window && (window.libp2p = libp2p)

  // Automatically start libp2p
  await libp2p.start()

  return libp2p
}

export default createLibp2p
