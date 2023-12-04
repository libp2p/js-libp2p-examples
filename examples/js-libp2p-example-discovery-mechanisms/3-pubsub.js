/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { floodsub } from '@libp2p/floodsub'
import { identify } from '@libp2p/identify'
import { mplex } from '@libp2p/mplex'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'

const createNode = async (bootstrappers = []) => {
  const config = {
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    streamMuxers: [yamux(), mplex()],
    connectionEncryption: [noise()],
    peerDiscovery: [
      pubsubPeerDiscovery({
        interval: 1000
      })
    ],
    services: {
      pubsub: floodsub(),
      identify: identify()
    }
  }

  if (bootstrappers.length > 0) {
    config.peerDiscovery.push(bootstrap({
      list: bootstrappers
    }))
  }

  return await createLibp2p(config)
}

const bootstrapper = await createNode([])

console.log(`libp2p bootstrapper started with id: ${bootstrapper.peerId.toString()}`)

const bootstrapperMultiaddrs = bootstrapper.getMultiaddrs().map((m) => m.toString())

const [node1, node2] = await Promise.all([
  createNode(bootstrapperMultiaddrs),
  createNode(bootstrapperMultiaddrs)
])

node1.addEventListener('peer:discovery', (evt) => {
  const peer = evt.detail
  console.log(`Peer ${node1.peerId.toString()} discovered: ${peer.id.toString()}`)
})
node2.addEventListener('peer:discovery', (evt) => {
  const peer = evt.detail
  console.log(`Peer ${node2.peerId.toString()} discovered: ${peer.id.toString()}`)
})
