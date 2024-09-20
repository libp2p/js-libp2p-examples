import path from 'path'
import { fileURLToPath } from 'url'
import { waitForOutput } from 'test-ipfs-example/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function test () {
  process.stdout.write('1.js\n')

  await waitForOutput('/p2p/', 'node', [path.join(__dirname, '../1.js')], {
    cwd: __dirname
  })
}
