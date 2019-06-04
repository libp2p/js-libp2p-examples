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

const pull = require('pull-stream')
const PeerInfo = require('peer-info')
const idJSON = require('./id.json')
const Chat = require('./chat')

const TOPIC = '/libp2p/chat/ipfs-camp/2019'
let chat

PeerInfo.create(idJSON, (err, peerInfo) => {
  if (err) throw err

  // Wildcard listen on TCP and Websocket
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63785')
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63786/ws')

  // Create the node
  const bootstrapNode = createBootstrapNode(peerInfo)

  bootstrapNode.handle('/libp2p/chat/1.0.0', (_, stream) => {
    pull(
      pull.values([Buffer.from('response')]),
      stream,
      pull.collect((err, message) => {
        if (err) return console.error(err)
        console.log(String(message))
      })
    )
  })

  chat = new Chat(bootstrapNode, TOPIC, ({ from, message }) => {
    console.log(`${from.substring(0, 6)}(${new Date(message.created).toLocaleTimeString()}): ${message.data}`)
  })

  // Start the node
  bootstrapNode.start((err) => {
    if (err) throw err

    console.log('Node started with addresses:')
    bootstrapNode.peerInfo.multiaddrs.forEach(ma => console.log(ma.toString()))
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
