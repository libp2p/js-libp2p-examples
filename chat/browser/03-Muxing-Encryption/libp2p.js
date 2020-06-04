import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'
import multiaddr from 'multiaddr'
// TODO: import `libp2p-mplex`
// TODO: import `libp2p-secio`

const createLibp2p = async (peerInfo) => {
  // Add the signaling server multiaddr to the peerInfo multiaddrs list
  peerInfo.multiaddrs.add(`/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/p2p/${peerInfo.id.toB58String()}`)

  // Create the Node
  const libp2p = await Libp2p.create({
    peerInfo,
    modules: {
      transport: [Websockets, WebrtcStar]
    }
  })

  // TODO: Listen on libp2p for `peer:connect` and log the provided PeerInfo.id.toB58String() peer id string.

  // Automatically start libp2p
  await libp2p.start()

  // TODO: Create the multiaddr to the Bootstrap's Websocket address
  const targetAddress = multiaddr('/ip4/127.0.0.1/tcp/63786/ws/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d')
  // And dial it. The UI is listening for connections,
  // so it should update if the dial is successful.
  try {
    await libp2p.dial(targetAddress)
    console.info(`Connected to ${targetAddress.toString()}`)
  } catch (err) {
    console.error(err)
  }

  return libp2p
}

export default createLibp2p