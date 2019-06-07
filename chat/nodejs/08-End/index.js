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
// Chat over Pubsub
const PubsubChat = require('./chat')
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
    },
    EXPERIMENTAL: {
      pubsub: true
    }
  }
}, (err, libp2p) => {
  if (err) throw err

  // Wildcard listen on TCP and Websocket
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
  libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')

  const pubsubChat = new PubsubChat(libp2p, PubsubChat.TOPIC, ({ from, message }) => {
    let fromMe = from === libp2p.peerInfo.id.toB58String()
    let user = from.substring(0, 6)
    if (pubsubChat.userHandles.has(from)) {
      user = pubsubChat.userHandles.get(from)
    }
    console.info(`${fromMe ? PubsubChat.CLEARLINE : ''}${user}(${new Date(message.created).toLocaleTimeString()}): ${message.data}`)
  })

  // Listener for peer connection events
  libp2p.on('peer:connect', (peerInfo) => {
    console.info(`Connected to ${peerInfo.id.toB58String()}!`)
  })

  // Set up our input handler
  process.stdin.on('data', (message) => {
    message = message.slice(0, -1)
    // If there was a command, exit early
    if (pubsubChat.checkCommand(message)) return

    // Publish the message
    pubsubChat.send(message, (err) => {
      if (err) console.error('Could not publish chat', err)
    })
  })

  // Start libp2p
  libp2p.start((err) => {
    if (err) throw err
  })
})
