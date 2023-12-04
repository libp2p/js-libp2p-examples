import path from 'path'
import { fileURLToPath } from 'url'
import { waitForOutput } from 'test-ipfs-example/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.stdout.write('1-echo.js\n')

await waitForOutput('Echoed back to us: "hello world"', 'node', [path.join(__dirname, '..', '1-echo.js')], {
  cwd: __dirname
})
