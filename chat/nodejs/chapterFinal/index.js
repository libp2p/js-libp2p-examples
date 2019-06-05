'use strict'

// Libp2p Core
const Libp2p = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
// Stream Multiplexers
const Mplex = require('pull-mplex')
// Encryption
const Secio = require('libp2p-secio')
// Discovery
const Bootstrap = require('libp2p-bootstrap')
const MDNS = require('libp2p-mdns')
// DHT
const KademliaDHT = require('libp2p-kad-dht')

const PeerInfo = require('peer-info')
const idJSON = require('../id.json')
const Chat = require('./chat')

// Chat protocol
const ChatProtocol = require('./chat-protocol')

const TOPIC = '/libp2p/chat/ipfs-camp/2019'
let chat

PeerInfo.create(idJSON, (err, peerInfo) => {
  if (err) throw err

  // Wildcard listen on TCP and Websocket
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63785')
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63786/ws')

  // Create the node
  const libp2p = createBootstrapNode(peerInfo)

  // Add chat handler
  libp2p.handle(ChatProtocol.PROTOCOL, ChatProtocol.handler)

  // Set up our input handler
  process.stdin.on('data', (message) => {
    // Iterate over all peers, and send messages to peers we are connected to
    libp2p.peerBook.getAllArray().forEach(peerInfo => {
      // Don't send messages if we're not connected
      if (!peerInfo.isConnected()) return

      libp2p.dialProtocol(peerInfo, ChatProtocol.PROTOCOL, (err, stream) => {
        if (err) return console.error('Could not negotiate chat protocol stream with peer', err)
        ChatProtocol.send(message, stream)
      })
    })
  })

  chat = new Chat(libp2p, TOPIC, ({ from, message }) => {
    console.log(`${from.substring(0, 6)}(${new Date(message.created).toLocaleTimeString()}): ${message.data}`)
  })

  // Start the node
  libp2p.start((err) => {
    if (err) throw err

    console.log('Node started with addresses:')
    libp2p.peerInfo.multiaddrs.forEach(ma => console.log(ma.toString()))
  })

  process.stdin.on('data', (message) => {
    chat.send(message, (err) => {
      if (err) {
        console.error('Publish error', err)
      }
    })
  })
})

const createBootstrapNode = (peerInfo) => {
  return new Libp2p({
    peerInfo,
    modules: {
      transport: [ TCP, Websockets ],
      streamMuxer: [ Mplex ],
      connEncryption: [ Secio ],
      peerDiscovery: [ Bootstrap, MDNS ],
      dht: KademliaDHT
    },
    config: {
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: false
        }
      },
      dht: {
        enabled: true,
        randomWalk: {
          enabled: true
        }
      },
      peerDiscovery: {
        bootstrap: {
          enabled: true,
          list: [
            // '/ip4/127.0.0.1/tcp/63786/ws/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d'
          ]
        }
      },
      EXPERIMENTAL: {
        pubsub: true
      }
    }
  })
}
