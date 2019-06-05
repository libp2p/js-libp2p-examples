'use strict'

// Libp2p Core
const Libp2p = require('libp2p')
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

// PeerInfo, required when creating a libp2p instance
const PeerInfo = require('peer-info')

// Generate our PeerInfo
PeerInfo.create((err, peerInfo) => {
  if (err) throw err

  // Wildcard listen on TCP and Websocket
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')

  // Create the node
  const libp2p = new Libp2p({
    peerInfo,
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
  })

  const pubsubChat = new PubsubChat(libp2p, PubsubChat.TOPIC, ({ from, message }) => {
    let user = from === libp2p.peerInfo.id.toB58String() ? 'Me' : from.substring(0, 6)
    console.log(`${user}(${new Date(message.created).toLocaleTimeString()}): ${message.data}`)
  })

  // Listener for peer connection events
  libp2p.on('peer:connect', (peerInfo) => {
    console.info(`Connected to ${peerInfo.id.toB58String()}!`)
  })

  // Set up our input handler
  process.stdin.on('data', (message) => {
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
