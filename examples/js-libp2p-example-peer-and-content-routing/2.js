/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { identify, identifyPush } from '@libp2p/identify'
import { kadDHT, removePublicAddressesMapper } from '@libp2p/kad-dht'
import { tcp } from '@libp2p/tcp'
import all from 'it-all'
import { createLibp2p } from 'libp2p'
import { CID } from 'multiformats/cid'

const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()],
    services: {
      dht: kadDHT({
        protocol: '/ipfs/lan/kad/1.0.0',
        peerInfoMapper: removePublicAddressesMapper,
        clientMode: false
      }),
      identify: identify(),
      identifyPush: identifyPush()
    }
  })

  return node
}

const [node1, node2, node3] = await Promise.all([
  createNode(),
  createNode(),
  createNode()
])

await Promise.all([
  node1.dial(node2.getMultiaddrs()),
  node2.dial(node3.getMultiaddrs())
])

const cid = CID.parse('QmTp9VkYvnHyrqKQuFPiuZkiX9gPcqj6x5LJ1rmWuSySnL')
await node1.contentRouting.provide(cid)

console.log('Node %s is providing %s', node1.peerId.toString(), cid.toString())

const providers = await all(node3.contentRouting.findProviders(cid, { timeout: 3000 }))

console.log('Found provider:', providers[0].id.toString())
