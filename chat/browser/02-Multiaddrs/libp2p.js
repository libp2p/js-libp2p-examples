import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'

const createLibp2p = (peerInfo) => {
  // Create the Node
  const libp2p = new Libp2p({
    peerInfo,
    modules: {
      transport: [ Websockets, WebrtcStar ],
    }
  })

  // Automatically start libp2p
  libp2p.start((err) => {
    if (err) throw err

    /* TODO: Create a multiaddr for the Bootstrap nodes address */
    /* TODO: Dial the multiaddr and log any errors */
    /* TODO: log a success message if there are no errors, we're connected! */
  })

  return libp2p
}

export default createLibp2p
