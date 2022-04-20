'use strict'

// Libp2p Core
const Libp2p = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebrtcStar = require('libp2p-webrtc-star')
const wrtc = require('wrtc')
// Stream Muxer
const Mplex = require('libp2p-mplex')
// Connection Encryption
const { NOISE } = require('libp2p-noise')
// Chat over Pubsub
const PubsubChat = require('./chat')
// Peer Discovery
const Bootstrap = require('libp2p-bootstrap')
const MDNS = require('libp2p-mdns')
const KadDHT = require('libp2p-kad-dht')
// PubSub implementation
const Gossipsub = require('libp2p-gossipsub')
const args = require('minimist')(process.argv.slice(2))
const listenPort = args['bootstrap'] ? 0 : 63785
const listenAddrsList = [
    `/ip4/0.0.0.0/tcp/${listenPort}`,
    `/ip4/0.0.0.0/tcp/${listenPort}/ws`,
]
const peerDiscoveryList = args['bootstrap'] ? [ Bootstrap, MDNS ] : [ MDNS ]
const bootstrapList = args['bootstrap'] ? [ args['bootstrap'] ] : []
;(async () => {
  // Create the Node
  const node = await Libp2p.create({
    addresses: {
      listen: listenAddrsList
    },
    modules: {
      transport: [ TCP, Websockets ],
      streamMuxer: [ Mplex ],
      connEncryption: [ NOISE ],
      peerDiscovery: peerDiscoveryList,
      dht: KadDHT,
      pubsub: Gossipsub
    },
    config: {
      ...(args['bootstrap'] && { 
        peerDiscovery: {
          bootstrap: {
            list: bootstrapList
          }
        }
      }),
      dht: {
        enabled: true,
        randomWalk: {
          enabled: true
        }
      },
    }
  })
  
  if (!args['bootstrap']) {
    listenAddrsList.forEach(addr => {
      console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`)
    })
  }

  // Listen on node for `peer:connect` and log the provided connection.remotePeer.toB58String() peer id string.
  node.connectionManager.on('peer:connect', (connection) => {
    console.info(`Connected to ${connection.remotePeer.toB58String()}!`)
  })

    // Start node
  await node.start()

  // Create our PubsubChat client
  const pubsubChat = new PubsubChat(node, PubsubChat.TOPIC, ({ from, message }) => {
    let fromMe = from === node.peerId.toB58String()
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
