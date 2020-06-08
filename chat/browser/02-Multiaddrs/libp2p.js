import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'
// TODO: Import the multiaddr module

const createLibp2p = async (peerId) => {
  // Create the Node
  const libp2p = await Libp2p.create({
    peerId,
    addresses: {
      // TODO: Add the signaling server multiaddr to listen list
      listen: [

      ]
    },
    modules: {
      transport: [Websockets, WebrtcStar]
    }
  })

  // Automatically start libp2p
  await libp2p.start()

  // TODO: Create the multiaddr to the Bootstrap's Websocket address
  // TODO: Dial the multiaddr and log any errors
  // TODO: log a success message if there are no errors, we're connected! */

  return libp2p
}

export default createLibp2p