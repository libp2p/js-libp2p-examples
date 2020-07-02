import Libp2p from 'libp2p'
/* TODO: import `libp2p-websockets` and `libp2p-webrtc-star` */

const createLibp2p = async (peerId) => {
  // Create the Node
  const libp2p = await Libp2p.create({
    peerId,
    modules: {
      transport: []
    }
  })

  // Automatically start libp2p
  await libp2p.start()

  return libp2p
}

export default createLibp2p
