import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'
import multiaddr from 'multiaddr'
// TODO: import `libp2p-mplex`
// TODO: import `libp2p-noise`
// TODO: import `libp2p-secio`

const createLibp2p = async (peerId) => {
  // Create the Node
  const libp2p = await Libp2p.create({
    peerId,
    addresses: {
      listen: [
        // Add the signaling server multiaddr
        '/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star'
      ]
    },
    modules: {
      transport: [Websockets, WebrtcStar]
    }
  })

  // TODO: Listen on libp2p for `peer:connect` and log the provided connection.remotePeer.toB58String() peer id string.

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