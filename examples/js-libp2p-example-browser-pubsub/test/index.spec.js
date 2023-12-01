/* eslint-disable no-console */
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { createLibp2p } from 'libp2p'
import { setup, expect } from 'test-ipfs-example/browser'

// Setup
const test = setup()

// DOM
const connectBtn = '#dial-multiaddr-button'
const connectAddr = '#dial-multiaddr-input'
const sendMessageInput = '#send-topic-message-input'
const sendMessageBtn = '#send-topic-message-button'
const output = '#output'
const listeningAddresses = '#listening-addresses'
const subscribeInput = '#subscribe-topic-input'
const subscribeBtn = '#subscribe-topic-button'
const topicPeers = '#topic-peers'
const peerId = '#peer-id'

let url

// we spawn a js libp2p relay
async function spawnRelay () {
  const relayNode = await createLibp2p({
    addresses: {
      listen: ['/ip4/127.0.0.1/tcp/0/ws']
    },
    transports: [
      webSockets({
        filter: filters.all
      })
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
      relay: circuitRelayServer()
    }
  })

  const relayNodeAddr = relayNode.getMultiaddrs()[0].toString()

  return { relayNode, relayNodeAddr }
}

test.describe('pubsub browser example:', () => {
  let relayNode
  let relayNodeAddr

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({ servers }, testInfo) => {
    testInfo.setTimeout(5 * 60_000)
    const r = await spawnRelay()
    relayNode = r.relayNode
    relayNodeAddr = r.relayNodeAddr
    url = servers[0].url
  }, {})

  test.afterAll(() => {
    relayNode.stop()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto(url)
  })

  test('should connect via a relay node', async ({ page: pageA, context }) => {
    // load second page
    const pageB = await context.newPage()
    await pageB.goto(url)

    // load page peer ids
    const pageAPeerId = await pageA.textContent(peerId)
    const pageBPeerId = await pageB.textContent(peerId)

    // connect the first page to the relay
    const webRTCAddressA = await dialRelay(pageA, relayNodeAddr)

    // dial first page from second page over relay
    await dialPeerOverRelay(pageB, webRTCAddressA)

    // stop the relay
    await relayNode.stop()

    const topicName = `topic-${Date.now()}`

    // subscribe to pubsub topic
    await subscribeToTopic(pageA, topicName)
    await subscribeToTopic(pageB, topicName)

    // wait for peers to appear in topic peers
    await waitForTopicPeers(pageA, pageBPeerId)
    await waitForTopicPeers(pageB, pageAPeerId)

    // send a message from one to the other
    await sendMessage(pageA, 'hello A', pageB)
  })
})

async function subscribeToTopic (page, topic) {
  // subscribe to the topic
  await page.fill(subscribeInput, topic)
  await page.click(subscribeBtn)

  // check the message was echoed back
  const outputLocator = page.locator(output)
  await expect(outputLocator).toContainText(`Subscribing to '${topic}'`)
}

async function waitForTopicPeers (page, otherPeer) {
  const outputLocator = page.locator(topicPeers)
  await expect(outputLocator).toContainText(otherPeer)
}

async function sendMessage (pageA, message, pageB) {
  // subscribe to the topic
  await pageA.fill(sendMessageInput, message)
  await pageA.click(sendMessageBtn)

  // check the message was received
  const outputLocator = pageB.locator(output)
  await expect(outputLocator).toContainText(message)
}

async function dialRelay (page, address) {
  // add the relay multiaddr to the input field and submit
  await page.fill(connectAddr, address)
  await page.click(connectBtn)

  const outputLocator = page.locator(output)
  await expect(outputLocator).toContainText(`Dialing '${address}'`)
  await expect(outputLocator).toContainText(`Connected to '${address}'`)

  const multiaddrsLocator = page.locator(listeningAddresses)
  await expect(multiaddrsLocator).toHaveText(/webrtc/)

  const multiaddrs = await page.textContent(listeningAddresses)
  const addr = multiaddrs.split(address).filter(str => str.includes('webrtc')).pop()

  return address + addr
}

async function dialPeerOverRelay (page, address) {
  // add the go libp2p multiaddr to the input field and submit
  await page.fill(connectAddr, address)
  await page.click(connectBtn)

  const outputLocator = page.locator(output)
  await expect(outputLocator).toContainText(`Dialing '${address}'`)
  await expect(outputLocator).toContainText(`Connected to '${address}'`)
}
