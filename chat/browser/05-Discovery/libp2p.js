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

const createLibp2p = (peerInfo) => {
  // Create the Node
  const libp2p = new Libp2p({
    peerInfo,
    modules: {
      transport: [ Websockets, WebrtcStar ],
      streamMuxer: [ Mplex ],
      connEncryption: [ Secio ]
    }
  })

  // Automatically start libp2p
  libp2p.start((err) => {
    if (err) throw err

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
