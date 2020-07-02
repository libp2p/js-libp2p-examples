'use strict'

// Libp2p Core
const Libp2p = require('libp2p')
// Transports
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const wrtc = require('wrtc')
// Stream Muxer
const Mplex = require('libp2p-mplex')
// Connection Encryption
const { NOISE } = require('libp2p-noise')
const Secio = require('libp2p-secio')
// Chat over Pubsub
const PubsubChat = require('./chat')
// Peer Discovery
const Bootstrap = require('libp2p-bootstrap')
const MDNS = require('libp2p-mdns')
const KadDHT = require('libp2p-kad-dht')
// Gossipsub
const Gossipsub = require('libp2p-gossipsub')

async function main() {
  // Create the Node
  const libp2p = await Libp2p.create({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0',
        '/ip4/0.0.0.0/tcp/0/ws',
        `/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star`
      ]
    },
    modules: {
      transport: [ TCP, Websockets, WebRTCStar ],
      streamMuxer: [ Mplex ],
      connEncryption: [ NOISE, Secio ],
      peerDiscovery: [ Bootstrap, MDNS ],
      dht: KadDHT,
      pubsub: Gossipsub
    },
    config: {
      transport : {
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc
        }
      },
      peerDiscovery: {
        bootstrap: {
          list: [ '/dnsaddr/sjc-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN' ]
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

  // Listen on libp2p for `peer:connect` and log the provided connection.remotePeer.toB58String() peer id string.
  libp2p.connectionManager.on('peer:connect', (connection) => {
    console.info(`Connected to ${connection.remotePeer.toB58String()}!`)
  })

  // Start libp2p
  await libp2p.start()

  // Log our PeerId and Multiaddrs
  console.info(`${libp2p.peerId.toB58String()} listening on addresses:`)
  console.info(libp2p.multiaddrs.map(addr => addr.toString()).join('\n'), '\n')

  // Create our PubsubChat client
  const pubsubChat = new PubsubChat(libp2p, PubsubChat.TOPIC, ({ from, message }) => {
    let fromMe = from === libp2p.peerId.toB58String()
    let user = fromMe ? 'Me' : from.substring(0, 6)
    if (pubsubChat.userHandles.has(from)) {
      user = pubsubChat.userHandles.get(from)
    }
    console.info(`${fromMe ? PubsubChat.CLEARLINE : ''}${user}(${new Date(message.created).toLocaleTimeString()}): ${message.data}`)
  })

  // Set up our input handler
  process.stdin.on('data', async (message) => {
    // Remove trailing newline
    message = message.slice(0, -1)
    // TODO: use pubsubChat.checkCommand(message) to exit early if it returns true

    // Publish the message
    try {
      await pubsubChat.send(message)
    } catch (err) {
      console.error('Could not publish chat', err)
    }
  })
}

main()
