'use strict'

// Libp2p Core
const { createLibp2p } = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebrtcStar = require('libp2p-webrtc-star')
const wrtc = require('wrtc')
// Multiaddr
const multiaddr = require('multiaddr')
// Stream Muxer
const Mplex = require('pull-mplex')
// Connection Encryption
const Secio = require('libp2p-secio')
// Chat protocol
const ChatProtocol = require('./chat-protocol')
// TODO: Import `libp2p-bootstrap`
// TODO: Import `libp2p-mdns`
// TODO: Import `libp2p-kad-dht`

const wrtcStar = new WebrtcStar({ wrtc })

// Create the Node
createLibp2p({
  modules: {
    transport: [ TCP, Websockets, wrtcStar ],
    streamMuxer: [ Mplex ],
    connEncryption: [ Secio ],
    // TODO: Add `libp2p-bootstrap` and the `webrtcStar.discovery` service
    peerDiscovery: [ ],
    // TODO: set the `dht` property to the imported `libp2p-kad-dht` value
  },
  // TODO: Uncomment the following lines
  // config: {
  //   peerDiscovery: {
  //     bootstrap: {
  //       // TODO: Update the IP address to match the bootstrap peer
  //       list: [ '/ip4/127.0.0.1/tcp/63785/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d' ]
  //     }
  //   },
  //   dht: {
  //     enabled: true,
  //     randomWalk: {
  //       enabled: true
  //     }
  //   }
  // }
}, (err, libp2p) => {
  if (err) throw err

  // Listen on libp2p for `peer:connect` and log the provided PeerInfo.id.toB58String() peer id string.
  libp2p.on('peer:connect', (peerInfo) => {
    console.info(`Connected to ${peerInfo.id.toB58String()}!`)
  })

  // Add a TCP listen address on port 0
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
  // Add a Websockets listen address on port 0
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')
  // Add the signaling server multiaddr to the peerInfo multiaddrs list
  libp2p.peerInfo.multiaddrs.add(`/ip4/127.0.0.1/tcp/15555/ws/p2p-webrtc-star/p2p/${libp2p.peerInfo.id.toB58String()}`)

  // Add chat handler
  libp2p.handle(ChatProtocol.PROTOCOL, ChatProtocol.handler)

  // Set up our input handler
  process.stdin.on('data', (message) => {
    // remove the newline
    message = message.slice(0, -1)
    // Iterate over all peers, and send messages to peers we are connected to
    libp2p.peerBook.getAllArray().forEach(peerInfo => {
      // Don't send messages if we're not connected or they dont support the chat protocol
      if (!peerInfo.isConnected() || !peerInfo.protocols.has(ChatProtocol.PROTOCOL)) return

      libp2p.dialProtocol(peerInfo, ChatProtocol.PROTOCOL, (err, stream) => {
        if (err) return console.error('Could not negotiate chat protocol stream with peer', err)
        ChatProtocol.send(message, stream)
      })
    })
  })

  // Start libp2p
  libp2p.start((err) => {
    if (err) throw err
    // TODO: remove the rest of the code in this function

    // Dial to the target peer
    const targetAddress = multiaddr('/ip4/127.0.0.1/tcp/63785/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d')
    libp2p.dial(targetAddress, (err) => {
      if (err) return console.error(err)
    })
  })
})
