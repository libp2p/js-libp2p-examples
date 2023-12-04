import path from 'path'
import { fileURLToPath } from 'url'
import { waitForOutput } from 'test-ipfs-example/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.stdout.write('2-request-response.js\n')

await waitForOutput('The answer is: "Is that an African or a European swallow?"', 'node', [path.join(__dirname, '..', '2-request-response.js')], {
  cwd: __dirname
})
