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
const Mplex = require('libp2p-mplex')
// Encryption
const Secio = require('libp2p-secio')
// Discovery
const MDNS = require('libp2p-mdns')
// DHT
const KademliaDHT = require('libp2p-kad-dht')
// PubSub
const Gossipsub = require('libp2p-gossipsub')

const PeerInfo = require('peer-info')
const idJSON = require('../id.json')
const PubsubChat = require('./chat')

// Chat protocol
const ChatProtocol = require('./chat-protocol')

;(async () => {
  const peerInfo = await PeerInfo.create(idJSON)

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
  const libp2p = await createBootstrapNode(peerInfo)

  // Add chat handler
  libp2p.handle(ChatProtocol.PROTOCOL, ChatProtocol.handler)

  // Set up our input handler
  process.stdin.on('data', (message) => {
    // remove the newline
    message = message.slice(0, -1)
    // Iterate over all peers, and send messages to peers we are connected to
    libp2p.peerStore.peers.forEach(async (peerInfo) => {
      // If they dont support the chat protocol, ignore
      if (!peerInfo.protocols.has(ChatProtocol.PROTOCOL)) return

      // If we're not connected, ignore
      const connection = libp2p.registrar.getConnection(peerInfo)
      if (!connection) return

      try {
        const { stream } = await connection.newStream([ChatProtocol.PROTOCOL])
        await ChatProtocol.send(message, stream)
      } catch (err) {
        console.error('Could not negotiate chat protocol stream with peer', err)
      }
    })
  })

  // Start the node
  await libp2p.start()
  console.log('Node started with addresses:')
  libp2p.peerInfo.multiaddrs.forEach(ma => console.log(ma.toString()))
  libp2p.peerInfo.protocols.forEach(p => console.log(p))

  // Create the Pubsub based chat extension
  const pubsubChat = new PubsubChat(libp2p, PubsubChat.TOPIC, ({ from, message }) => {
    let fromMe = from === libp2p.peerInfo.id.toB58String()
    let user = from.substring(0, 6)
    if (pubsubChat.userHandles.has(from)) {
      user = pubsubChat.userHandles.get(from)
    }
    console.info(`${fromMe ? PubsubChat.CLEARLINE : ''}${user}(${new Date(message.created).toLocaleTimeString()}): ${message.data}`)
  })

  // Set up our input handler
  process.stdin.on('data', async (message) => {
    // Remove trailing newline
    message = message.slice(0, -1)
    // If there was a command, exit early
    if (pubsubChat.checkCommand(message)) return

    try {
      // Publish the message
      await pubsubChat.send(message)
    } catch (err) {
      console.error('Could not publish chat', err)
    }
  })
})()


const createBootstrapNode = (peerInfo) => {
  return Libp2p.create({
    peerInfo,
    modules: {
      transport: [ WebrtcStar, TCP, Websockets ],
      streamMuxer: [ Mplex ],
      connEncryption: [ Secio ],
      peerDiscovery: [ MDNS ],
      dht: KademliaDHT,
      pubsub: Gossipsub
    },
    config: {
      transport : {
        [WebrtcStar.prototype[Symbol.toStringTag]]: {
          wrtc
        }
      },
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
      }
    }
  })
}
