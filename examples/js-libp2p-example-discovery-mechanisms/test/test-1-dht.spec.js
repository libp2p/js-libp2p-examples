import path from 'path'
import { fileURLToPath } from 'url'
import { waitForOutput } from 'test-ipfs-example/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.stdout.write('1.js\n')

await waitForOutput('Connection established to:', 'node', [path.join(__dirname, '..', '1-dht.js')], {
  cwd: __dirname
})
