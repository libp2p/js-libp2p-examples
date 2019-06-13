import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'

const createLibp2p = (peerInfo) => {
  // Create the Node
  const libp2p = new Libp2p({
    peerInfo,
    modules: {
      transport: [ Websockets ],
    }
  })

  // Automatically start libp2p
  libp2p.start((err) => {
    if (err) throw err
  })

  return libp2p
}

export default createLibp2p
