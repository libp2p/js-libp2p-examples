// Libp2p Core
import Libp2p from 'libp2p'
// Transports
import Websockets from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'
// Multiaddr creation
import multiaddr from 'multiaddr'
// Stream Muxer
import Mplex from 'libp2p-mplex'
// Connection Encryption
import { NOISE } from 'libp2p-noise'
import Secio from 'libp2p-secio'

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
      connEncryption: [NOISE, Secio]
    }
  })

  // Listener for peer connection events
  libp2p.connectionManager.on('peer:connect', (connection) => {
    console.info(`Connected to ${connection.remotePeer.toB58String()}!`)
  })

  // Automatically start libp2p
  await libp2p.start()

  // Create the multiaddr to the Bootstrap node
  const targetAddress = multiaddr('/dns4/sjc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN')
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
