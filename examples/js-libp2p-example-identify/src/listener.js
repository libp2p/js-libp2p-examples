import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { mdns } from '@libp2p/mdns'
import { identify } from '@libp2p/identify'

async function main () {
  const node = await createLibp2p({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0',
        '/ip4/0.0.0.0/tcp/0/ws'
      ]
    },
    transports: [
      tcp(),
      webSockets()
    ],
    streamMuxers: [
      yamux()
    ],
    connectionEncrypters: [
      noise()
    ],
    peerDiscovery: [
      mdns()
    ],
    services: {
      identify: identify()
    }
  })

  // Listen for new connections
  node.addEventListener('connection:open', (evt) => {
    console.log('New connection opened:', evt.detail.remotePeer.toString())
  })

  // Listen for identify events
  node.addEventListener('peer:identify', (evt) => {
    const { peerId, protocols, observedAddr, agentVersion, protocolVersion, listenAddrs } = evt.detail
    console.log('\n=== Identify Information ===')
    console.log('Peer ID:', peerId.toString())
    console.log('Agent Version:', agentVersion)
    console.log('Protocol Version:', protocolVersion)
    console.log('Supported protocols:', protocols)
    console.log('Observed address:', observedAddr)
    console.log('Listen addresses:', listenAddrs.map(addr => addr.toString()))
    console.log('===========================\n')
  })

  await node.start()
  console.log('Listener node started with peer ID:', node.peerId.toString())
  console.log('Listener multiaddrs:', node.getMultiaddrs().map(addr => addr.toString()).join('\n'))
}

main().catch(console.error) 