/* eslint no-console: ["off"] */

/* eslint-env mocha */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { autoTLS } from '@libp2p/auto-tls'
import { loadOrCreateSelfKey } from '@libp2p/config'
import { identify, identifyPush } from '@libp2p/identify'
import { keychain } from '@libp2p/keychain'
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
    webSockets()
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

    // requests a certificate and makes it available to libp2p, trusts that
    // `libp2p.direct` will answer DNS requests successfully
    autoTLS: autoTLS({
      autoConfirmAddress: true
    }),

    // opens ports on your router to allow libp2p.direct to dial us back - N.b
    // uPNP must be enabled for this to work. Trusts that network traffic will
    // reach us after this is done.
    uPnPNAT: uPnPNAT({
      autoConfirmAddress: true
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
