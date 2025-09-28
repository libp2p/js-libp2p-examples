import { spawn } from 'child_process'
import { multiaddr } from '@multiformats/multiaddr'
import { WebRTCDirect } from '@multiformats/multiaddr-matcher'
import { setup, expect } from 'test-ipfs-example/browser'

// Setup
const test = setup()

async function spawnServer () {
  const server = spawn('node', [
    'server.js'
  ], {
    cwd: '.',
    killSignal: 'SIGINT'
  })
  const serverAddr = await (new Promise(resolve => {
    server.stdout.on('data', (data) => {
      data.toString().split('\n')
        .map(line => line.trim())
        .forEach(line => {
          try {
            if (WebRTCDirect.matches(multiaddr(line))) {
              resolve(line)
            }
          } catch {}
        })
    })
  }))
  return { server, serverAddr }
}

test.describe('connect private to public node', () => {
  // DOM
  const connectBtn = '#connect'
  const connectAddr = '#peer'
  const messageInput = '#message'
  const sendBtn = '#send'
  const output = '#output'

  let server
  let serverAddr

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({ }, testInfo) => {
    testInfo.setTimeout(5 * 60_000)
    const s = await spawnServer()
    server = s.server
    serverAddr = s.serverAddr
  }, {})

  test.afterAll(() => {
    server.kill('SIGINT')
  })

  test.beforeEach(async ({ servers, page }) => {
    await page.goto(servers[0].url)
  })

  test('should connect to a private node over webrtc', async ({ page }) => {
    const message = 'hello'

    // add the go libp2p multiaddress to the input field and submit
    await page.fill(connectAddr, serverAddr)
    await page.click(connectBtn)

    // send the relay message to the go libp2p server
    await page.fill(messageInput, message)
    await page.click(sendBtn)

    await page.waitForSelector('#output:has(div)')

    // Expected output:
    //
    // Dialing '${serverAddr}'
    // Peer connected '${serverAddr}'
    // Sending message '${message}'
    // Received message '${message}'

    await expect(page.locator(output)).toContainText(`Dialing '${serverAddr}'`)
    await expect(page.locator(output)).toContainText(`Peer connected '${serverAddr}'`)

    await expect(page.locator(output)).toContainText(`Sending message '${message}'`)
    await expect(page.locator(output)).toContainText(`Received message '${message}'`)
  })
})
