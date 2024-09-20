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
const connectBtn = '#connect'
const connectAddr = '#peer'
const messageInput = '#message'
const sendBtn = '#send'
const output = '#output'
const listeningAddresses = '#multiaddrs'

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
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
      relay: circuitRelayServer()
    }
  })

  const relayNodeAddr = relayNode.getMultiaddrs()[0].toString()

  return { relayNode, relayNodeAddr }
}

test.describe('browser to browser example:', () => {
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

  test('should connect to another browser peer and send a message', async ({ page: pageA, context }) => {
    // load second page
    const pageB = await context.newPage()
    await pageB.goto(url)

    // connect the first page to the relay
    const relayedAddressA = await dialRelay(pageA, relayNodeAddr)

    // dial first page from second page over relay
    await dialPeerOverRelay(pageB, relayedAddressA)

    // stop the relay
    await relayNode.stop()

    // send a message from a to b
    await sendMessage(pageA, pageB, 'hello B from A')

    // send a message from b to a
    await sendMessage(pageB, pageA, 'hello A from B')
  })
})

async function sendMessage (senderPage, recipientPage, message) {
  // send the message to the peer over webRTC
  await senderPage.fill(messageInput, message)
  await senderPage.click(sendBtn)

  // check the message was sent
  await expect(senderPage.locator(output)).toContainText(`Sending message '${message}'`)
  // check the message was received
  await expect(recipientPage.locator(output)).toContainText(`Received message '${message}'`)
}

async function dialRelay (page, address) {
  // add the go libp2p multiaddress to the input field and submit
  await page.fill(connectAddr, address)
  await page.click(connectBtn)

  const outputLocator = page.locator(output)
  await expect(outputLocator).toContainText(`Dialing '${address}'`)
  await expect(outputLocator).toContainText('Connected to relay')

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
