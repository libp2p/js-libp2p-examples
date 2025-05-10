/* eslint-disable no-console */
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webRTCDirect } from '@libp2p/webrtc'
import { multiaddr } from '@multiformats/multiaddr'
import { pipe } from 'it-pipe'
import { createLibp2p } from 'libp2p'
import { setup, expect } from 'test-ipfs-example/browser'
import { fromString, toString } from 'uint8arrays'

// Setup
const test = setup()

let publicPeer
let privatePeer

async function createPeer (isPublic = false) {
  return await createLibp2p({
    transports: [webRTCDirect()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()]
  })
}

test.before(async () => {
  publicPeer = await createPeer(true)
  await publicPeer.start()

  privatePeer = await createPeer(false)
  await privatePeer.start()
})

test.after(async () => {
  await publicPeer.stop()
  await privatePeer.stop()
})

test('Private peer should connect to public peer', async () => {
  const publicAddr = publicPeer.getMultiaddrs()[0].toString()
  expect(publicAddr).toContain('/webrtc')

  const ma = multiaddr(publicAddr)
  await expect(privatePeer.dial(ma)).resolves.not.toThrow()
})

test('Private peer should send and receive a message', async () => {
  const { stream } = await privatePeer.dialProtocol(publicPeer.peerId, ['/chat/1.0.0'])
  const message = 'Hello WebRTC'

  await pipe(
    [fromString(message)],
    stream.sink
  )

  await publicPeer.handle('/chat/1.0.0', async ({ stream }) => {
    await pipe(
      stream.source,
      async function (source) {
        for await (const msg of source) {
          expect(toString(msg)).toBe(message)
        }
      }
    )
  })
})
