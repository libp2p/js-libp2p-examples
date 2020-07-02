'use strict'
// require `libp2p-tcp`, `libp2p-websockets`, and `libp2p-webrtc-star`
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
// require `wrtc`
const wrtc = require('wrtc')
// Multiaddr
const multiaddr = require('multiaddr')
// require `libp2p-mplex`
const Mplex = require('libp2p-mplex')
// require `libp2p-noise`
const { NOISE } = require('libp2p-noise')
// require `libp2p-secio`
const Secio = require('libp2p-secio')
// Chat protocol
const ChatProtocol = require('./chat-protocol')

// Libp2p Core
const Libp2p = require('libp2p')

async function main() {
  // Create the Node
  const libp2p = await Libp2p.create({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0',
        '/ip4/0.0.0.0/tcp/0/ws',
        `/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star`
      ]
    },
    modules: {
      transport: [ TCP, Websockets, WebRTCStar ],
      streamMuxer: [ Mplex ],
      connEncryption: [ NOISE, Secio ],
    },
    config: {
      transport : {
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc
        }
      }
    }
  })

  // Listen on libp2p for `peer:connect` and log the provided connection.remotePeer.toB58String() peer id string.
  libp2p.connectionManager.on('peer:connect', (connection) => {
    console.info(`Connected to ${connection.remotePeer.toB58String()}!`)
  })

  // TODO: Add chat handler
  // libp2p.handle(ChatProtocol.PROTOCOL, ChatProtocol.handler)

  // start libp2p
  await libp2p.start()

  // Log our PeerId and Multiaddrs
  console.info(`${libp2p.peerId.toB58String()} listening on addresses:`)
  console.info(libp2p.multiaddrs.map(addr => addr.toString()).join('\n'), '\n')

  // TODO: uncomment the input handler code below
  // // Set up our input handler
  // process.stdin.on('data', (message) => {
  //   // remove the newline
  //   message = message.slice(0, -1)
  //   // Iterate over all peers, and send messages to peers we are connected to
  //   libp2p.peerStore.peers.forEach(async (peerData) => {
  //     // If they dont support the chat protocol, ignore
  //     if (!peerData.protocols.includes(ChatProtocol.PROTOCOL)) return

  //     // If we're not connected, ignore
  //     const connection = libp2p.connectionManager.get(peerData.id)
  //     if (!connection) return

  //     try {
  //       const { stream } = await connection.newStream([ChatProtocol.PROTOCOL])
  //       await ChatProtocol.send(message, stream)
  //     } catch (err) {
  //       console.error('Could not negotiate chat protocol stream with peer', err)
  //     }
  //   })
  // })

  // once started, use `libp2p.dial` to dial to the Bootstrap node
  const targetAddress = multiaddr('/dnsaddr/sjc-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN')
  try {
    await libp2p.dial(targetAddress)
  } catch (err) {
    console.error(err)
  }
}

main()
