'use strict'

// Libp2p Core
const Libp2p = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebrtcStar = require('libp2p-webrtc-star')
// wrtc for node to supplement WebrtcStar
const wrtc = require('wrtc')
// Signaling Server for webrtc
const SignalingServer = require('libp2p-webrtc-star/src/sig-server')

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
const PubsubChat = require('./chat')

// Chat protocol
const ChatProtocol = require('./chat-protocol')

let pubsubChat

PeerInfo.create(idJSON, async (err, peerInfo) => {
  if (err) throw err

  // Wildcard listen on TCP and Websocket
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63785')
  peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63786/ws')

  const signalingServer = await SignalingServer.start({
    port: 15555
  })
  const ssAddr = `/ip4/${signalingServer.info.host}/tcp/${signalingServer.info.port}/ws/p2p-webrtc-star`
  console.info(`Signaling server running at ${ssAddr}`)
  peerInfo.multiaddrs.add(`${ssAddr}/p2p/${peerInfo.id.toB58String()}`)

  // Create the node
  const libp2p = createBootstrapNode(peerInfo)

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

  const pubsubChat = new PubsubChat(libp2p, PubsubChat.TOPIC, ({ from, message }) => {
    let fromMe = from === libp2p.peerInfo.id.toB58String()
    let user = from.substring(0, 6)
    if (pubsubChat.userHandles.has(from)) {
      user = pubsubChat.userHandles.get(from)
    }
    console.info(`${fromMe ? PubsubChat.CLEARLINE : ''}${user}(${new Date(message.created).toLocaleTimeString()}): ${message.data}`)
  })

  // Start the node
  libp2p.start((err) => {
    if (err) throw err

    console.log('Node started with addresses:')
    libp2p.peerInfo.multiaddrs.forEach(ma => console.log(ma.toString()))
  })

  // Set up our input handler
  process.stdin.on('data', (message) => {
    // remove the newline
    message = message.slice(0, -1)
    // If there was a command, exit early
    if (pubsubChat.checkCommand(message)) return

    // Publish the message
    pubsubChat.send(message, (err) => {
      if (err) console.error('Could not publish chat', err)
    })
  })
})

const createBootstrapNode = (peerInfo) => {
  const webrtcStar = new WebrtcStar({ wrtc: wrtc })

  return new Libp2p({
    peerInfo,
    modules: {
      transport: [ webrtcStar, TCP, Websockets ],
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
