// Libp2p Core
import Libp2p from 'libp2p'
// Transports
import Websockets from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'
// Multiaddr creation
import multiaddr from 'multiaddr'
// Stream Muxer
import Mplex from 'pull-mplex'
// Connection Encryption
import Secio from 'libp2p-secio'
// Discovery
// TODO: Import `libp2p-bootstrap`
// TODO: Import `libp2p-kad-dht`

const createLibp2p = (peerInfo) => {
  // Add the signaling server multiaddr to the peerInfo multiaddrs list
  peerInfo.multiaddrs.add(`/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/p2p/${peerInfo.id.toB58String()}`)

  // TODO: Create an instance of WebrtcStar named `webrtcStar`

  // Create the Node
  const libp2p = new Libp2p({
    peerInfo,
    modules: {
      // TODO: Replace WebrtcStar, with the new instance you created above
      transport: [ Websockets, WebrtcStar ],
      streamMuxer: [ Mplex ],
      connEncryption: [ Secio ],
      // TODO: Add `libp2p-bootstrap` and the `webrtcStar.discovery` service
      peerDiscovery: [ ],
      // TODO: set the `dht` property to the imported `libp2p-kad-dht` value
      dht: undefined
    },
    config: {
      peerDiscovery: {
        bootstrap: {
          // TODO: Update the IP address to match the bootstrap peer
          list: [ '/ip4/127.0.0.1/tcp/63786/ws/p2p/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d' ]
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

  // Automatically start libp2p
  libp2p.start((err) => {
    if (err) throw err
    // TODO: remove the rest of the code inside this function

    // Create the multiaddr to the Bootstrap node
    const targetAddress = multiaddr('/ip4/127.0.0.1/tcp/63786/ws/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d')
    // And dial it. The UI is listening for connections,
    // so it should update if the dial is successful.
    libp2p.dial(targetAddress, (err) => {
      if (err) return console.error(err)
    })
  })

  return libp2p
}

export default createLibp2p
