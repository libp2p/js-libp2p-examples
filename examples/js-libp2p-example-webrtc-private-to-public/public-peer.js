/* eslint-disable linebreak-style */
/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify, identifyPush } from '@libp2p/identify'
import { ping } from '@libp2p/ping'
import { webRTC } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { createLibp2p } from 'libp2p'

// const RELAY_MULTIADDR = process.argv[2]

async function createPublicNode () {
  const publicNode = await createLibp2p({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/4005/ws',
        '/ip4/0.0.0.0/tcp/4006/webrtc'
      ]
    },
    transports: [
      webSockets({
        filter: filters.all
      }),
      webRTC(),
      circuitRelayTransport()
    ], // Discover at least one relay]
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
      identifyPush: identifyPush(),
      ping: ping()
    }
  })

  try {
    await publicNode.start()
    console.log('Public Node started')
    console.log(`Peer Id: ${publicNode.peerId.toString()}`)
  } catch (error) {
    console.error('Failed to start Public Node:', error)
  }
  console.log('Listening on:')
  publicNode.getMultiaddrs().forEach((ma) => console.log(ma.toString()))

  publicNode.handle('/webrtc-chat/1.0.0', async ({ stream }) => {
    console.log('Public Node: Incoming connection from private node')
    const reader = stream.source.pipeThrough(new TextDecoderStream()).getReader()
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        console.log(`Public Node Received: ${value}`)
      }
    } catch (err) {
      console.error('Public Node: Error reading from stream:', err)
    }
  })
  return publicNode
}
createPublicNode()
