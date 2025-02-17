/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import { multiaddr } from '@multiformats/multiaddr'
import { createLibp2p } from 'libp2p'

async function main () {
  const listenNodeAddr = process.argv[2]
  if (!listenNodeAddr) {
    throw new Error('The listening node address needs to be specified')
  }

  const node = await createLibp2p({
    transports: [
      webSockets(),
      circuitRelayTransport()
    ],
    connectionEncrypters: [
      noise()
    ],
    streamMuxers: [
      yamux()
    ],
    services: {
      identify: identify()
    }
  })

  console.log(`Node started with id ${node.peerId.toString()}`)

  const ma = multiaddr(listenNodeAddr)
  const conn = await node.dial(ma, {
    signal: AbortSignal.timeout(10_000)
  })
  console.log(`Connected to the listening node via ${conn.remoteAddr.toString()}`)
}

main()
