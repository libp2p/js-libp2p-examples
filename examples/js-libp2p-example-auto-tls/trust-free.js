/* eslint no-console: ["off"] */

/* eslint-env mocha */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { autoTLS } from '@ipshipyard/libp2p-auto-tls'
import { autoNAT } from '@libp2p/autonat'
import { bootstrap } from '@libp2p/bootstrap'
import { loadOrCreateSelfKey } from '@libp2p/config'
import { identify, identifyPush } from '@libp2p/identify'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { keychain } from '@libp2p/keychain'
import { tcp } from '@libp2p/tcp'
import { uPnPNAT } from '@libp2p/upnp-nat'
import { webSockets } from '@libp2p/websockets'
import { WebSocketsSecure } from '@multiformats/multiaddr-matcher'
import { LevelDatastore } from 'datastore-level'
import { createLibp2p } from 'libp2p'

const datastore = new LevelDatastore('./db')
await datastore.open()

const privateKey = await loadOrCreateSelfKey(datastore)

const libp2p = await createLibp2p({
  privateKey,
  datastore,
  addresses: {
    listen: [
      '/ip4/0.0.0.0/tcp/0/ws',
      '/ip6/::/tcp/0/ws'
    ]
  },
  transports: [
    webSockets(),
    tcp()
  ],
  connectionEncrypters: [
    noise()
  ],
  streamMuxers: [
    yamux()
  ],
  services: {
    // needed to run KAD-DHT and to be contacted by libp2p.direct
    identify: identify(),
    identifyPush: identifyPush(),

    // used to securely store the certificate for use after a restart
    keychain: keychain(),

    // requests a certificate and makes it available to libp2p
    autoTLS: autoTLS(),

    // opens ports on your router to allow libp2p.direct to dial us back - N.b
    // uPNP must be enabled for this to work
    uPnPNAT: uPnPNAT(),

    // verifies that our reported public addresses are dialable
    autoNAT: autoNAT(),

    // used to find peers to run AutoNAT
    aminoDHT: kadDHT({
      protocol: '/ipfs/kad/1.0.0',
      peerInfoMapper: removePrivateAddressesMapper
    }),

    // these peers help us fill our DHT routing table
    bootstrap: bootstrap({
      list: [
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
        '/dnsaddr/va1.bootstrap.libp2p.io/p2p/12D3KooWKnDdG3iXw9eTFijk3EWSunZcFi54Zka4wmtqtt6rPxc8',
        '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
      ]
    })
  }
})

libp2p.addEventListener('certificate:provision', () => {
  console.info('A TLS certificate was provisioned')

  const interval = setInterval(() => {
    const mas = libp2p
      .getMultiaddrs()
      .filter(ma => WebSocketsSecure.exactMatch(ma) && ma.toString().includes('/sni/'))
      .map(ma => ma.toString())

    if (mas.length > 0) {
      console.info('addresses:')
      console.info(mas.join('\n'))
      clearInterval(interval)
    }
  }, 1_000)
})
