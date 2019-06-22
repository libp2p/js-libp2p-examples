import Libp2p from 'libp2p'
/* TODO: import `libp2p-websockets` and `libp2p-webrtc-star` */

const createLibp2p = (peerInfo) => {
  // Create the Node
  const libp2p = new Libp2p({
    peerInfo,
    modules: {
      transport: [ /* TODO: add `libp2p-websockets` and `libp2p-webrtc-star` */ ],
    }
  })

  // Automatically start libp2p
  libp2p.start((err) => {
    if (err) throw err
  })

  return libp2p
}

export default createLibp2p
