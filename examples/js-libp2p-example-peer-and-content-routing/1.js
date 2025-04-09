/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { identify, identifyPush } from '@libp2p/identify'
import { kadDHT, removePublicAddressesMapper } from '@libp2p/kad-dht'
import { ping } from '@libp2p/ping'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'

const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()],
    services: {
      // configure Kad-DHT to run on the local network
      dht: kadDHT({
        protocol: '/ipfs/lan/kad/1.0.0',
        peerInfoMapper: removePublicAddressesMapper,
        clientMode: false
      }),
      identify: identify(),
      identifyPush: identifyPush(),
      ping: ping()
    }
  })

  return node
}

const [node1, node2, node3] = await Promise.all([
  createNode(),
  createNode(),
  createNode()
])

// Connect the nodes 1 -> 2 -> 3
await Promise.all([
  node1.dial(node2.getMultiaddrs()),
  node2.dial(node3.getMultiaddrs())
])

// find peer 3 from peer 1 (there is no direct connection)
const peer = await node1.peerRouting.findPeer(node3.peerId)

console.log('Found it, multiaddrs are:')
peer.multiaddrs.forEach((ma) => console.log(ma.toString()))
