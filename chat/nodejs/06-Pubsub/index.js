'use strict'

// Libp2p Core
const { createLibp2p } = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
// Stream Muxer
const Mplex = require('pull-mplex')
// Connection Encryption
const Secio = require('libp2p-secio')
// Chat protocol
const ChatProtocol = require('./chat-protocol')
// Peer Discovery
const Bootstrap = require('libp2p-bootstrap')
const MDNS = require('libp2p-mdns')
const KadDHT = require('libp2p-kad-dht')

// Create the Node
createLibp2p({
  modules: {
    transport: [ TCP, Websockets ],
    streamMuxer: [ Mplex ],
    connEncryption: [ Secio ],
    peerDiscovery: [ Bootstrap, MDNS ],
    dht: KadDHT
  },
  config: {
    peerDiscovery: {
      bootstrap: {
        list: [ '/ip4/127.0.0.1/tcp/63785/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d' ]
      }
    },
    dht: {
      enabled: true,
      randomWalk: {
        enabled: true
      }
    }
  }
}, (err, libp2p) => {
  if (err) throw err

  // Wildcard listen on TCP and Websocket
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')

  // Listener for peer connection events
  libp2p.on('peer:connect', (peerInfo) => {
    console.info(`Connected to ${peerInfo.id.toB58String()}!`)
  })

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
  })
})
