/* eslint-disable no-console */
import { createDelegatedRoutingV1HttpApiServer } from '@helia/delegated-routing-v1-http-api-server'
import { peerIdFromString } from '@libp2p/peer-id'
import { createHelia } from 'helia'
import { setup, expect } from 'test-ipfs-example/browser'

// Setup
const test = setup()

// DOM
const findProvidersInput = '#find-providers-input'
const findProvidersBtn = '#find-providers-button'
const findPeerInput = '#find-peer-input'
const findPeerBtn = '#find-peer-button'
const output = '#output'

let url

// start a libp2p node to delegate to
async function spawnServer () {
  const helia = await createHelia({
    routers: [{
      // dummy router that always finds providers
      findProviders: async function * () {
        yield {
          id: peerIdFromString('QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'),
          multiaddrs: [],
          protocols: []
        }
      },
      findPeer: async function () {
        return {
          id: peerIdFromString('QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'),
          multiaddrs: []
        }
      }
    }]
  })
  const fastify = await createDelegatedRoutingV1HttpApiServer(helia, {
    listen: {
      host: '127.0.0.1',
      port: 9832,
      listenTextResolver: (address) => { return `server is listening at ${address}` }
    }
  })

  return { helia, fastify }
}

test.describe('delegated routing example:', () => {
  let helia
  let fastify

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({ servers }, testInfo) => {
    testInfo.setTimeout(5 * 60_000)
    const r = await spawnServer()
    helia = r.helia
    fastify = r.fastify
    url = servers[0].url
  }, {})

  test.afterAll(async () => {
    await fastify.close()
    await helia.stop()
  })

  test.beforeEach(async ({ page }) => {
    await page.goto(url)
  })

  test('should find providers using the delegate', async ({ page, context }) => {
    // add the empty directory CID to the input field and submit
    await page.fill(findProvidersInput, 'bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354')
    await page.click(findProvidersBtn)

    const outputLocator = page.locator(output)
    await expect(outputLocator).toContainText('[')
  })

  test('should find peer using the delegate', async ({ page, context }) => {
    // add the relay multiaddr to the input field and submit
    await page.fill(findPeerInput, 'QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN')
    await page.click(findPeerBtn)

    const outputLocator = page.locator(output)
    await expect(outputLocator).toContainText('multiaddrs":')
  })
})
