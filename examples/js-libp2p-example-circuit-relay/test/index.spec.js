import path from 'path'
import { fileURLToPath } from 'url'
import { matchOutput, waitForOutput } from 'test-ipfs-example/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Step 1 process
process.stdout.write('relay.js\n')

const {
  process: relay,
  matches: [relayAddress]
} = await matchOutput(/^(\/ip4\/.*)$/m, 'node', [path.resolve(__dirname, '../relay.js')])

process.stdout.write('==================================================================\n')

// Step 2 process
process.stdout.write('listener.js\n')

const {
  process: listener,
  matches: [, autoRelayAddr]
} = await matchOutput(/^Listening on a relay address of (\/ip4\/.*)$/m, 'node', [path.resolve(__dirname, '../listener.js'), relayAddress])

process.stdout.write('==================================================================\n')

// Step 3 process
process.stdout.write('dialer.js\n')

await waitForOutput(`Connected to the listening node via ${autoRelayAddr}`, 'node', [path.resolve(__dirname, '../dialer.js'), autoRelayAddr])

listener.kill()
relay.kill()
