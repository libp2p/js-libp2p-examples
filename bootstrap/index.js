'use strict'

// Libp2p Core
const Libp2p = require('libp2p')
// Transports
const Websockets = require('libp2p-websockets')
// Stream Multiplexers
const Mplex = require('pull-mplex')
// Discovery
const Mdns = require('libp2p-mdns')
// Encryption
const Secio = require('libp2p-secio')
// DHT
const DHT = require('libp2p-kad-dht')

const pull = require('pull-stream')
const PeerInfo = require('peer-info')
const idJSON = require('./id.json')
const Chat = require('../common/chat')

PeerInfo.create(idJSON, (err, peerInfo) => {
  if (err) throw err

  // Wildcard listen on websocket
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63785/ws')

  // Create the node
  const bootstrapNode = createBootstrapNode(peerInfo)
  const chat = new Chat(bootstrapNode, '/libp2p/chat/ipfs-camp/2019', (message) => {
    console.log(`${message.from}: ${String(message.data)}`)
  })

  bootstrapNode.handle('/libp2p/chat/1.0.0', (_, stream) => {
    pull(
      stream,
      pull.collect((err, message) => {
        if (err) return console.error(err)
        console.log(String(message))
      })
    )
  })

  // Start the node
  bootstrapNode.start((err) => {
    if (err) throw err

    // bootstrapNode.pubsub.subscribe('/libp2p/chat/ipfs-camp/2019', null, (message) => {
    //   console.log(`${message.from}: ${String(message.data)}`)
    // }, (err) => {
    //   console.log('Subscribed to /libp2p/chat/ipfs-camp/2019')
    // })

    console.log('Node started with addresses:')
    bootstrapNode.peerInfo.multiaddrs.forEach(ma => console.log(ma.toString()))
  })
})

const createBootstrapNode = (peerInfo) => {
  return new Libp2p({
    peerInfo,
    modules: {
      transport: [ Websockets ],
      streamMuxer: [ Mplex ],
      connEncryption: [ Secio ],
      peerDiscovery: [ Mdns ],
      dht: DHT
    },
    config: {
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true
        }
      },
      EXPERIMENTAL: {
        pubsub: true
      }
    }
  })
}
