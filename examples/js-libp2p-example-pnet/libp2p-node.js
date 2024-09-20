import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { preSharedKey } from '@libp2p/pnet'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'

/**
 * privateLibp2pNode returns a libp2p node function that will use the swarm
 * key with the given `swarmKey` to create the Protector
 *
 * @param {any} swarmKey
 */
export async function privateLibp2pNode (swarmKey) {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()], // We're only using the TCP transport for this example
    streamMuxers: [yamux()], // We're only using yamux muxing
    // Let's make sure to use identifying crypto in our pnet since the protector
    // doesn't care about node identity, and only the presence of private keys
    connectionEncrypters: [noise()],
    // Leave peer discovery empty, we don't want to find peers. We could omit
    // the property, but it's being left in for explicit readability.
    // We should explicitly dial pnet peers, or use a custom discovery service
    // for finding nodes in our pnet
    peerDiscovery: [],
    connectionProtector: preSharedKey({
      psk: swarmKey
    })
  })

  return node
}
