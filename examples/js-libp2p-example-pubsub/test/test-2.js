import path from 'path'
import { fileURLToPath } from 'url'
import { waitForOutput } from 'test-ipfs-example/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function test () {
  process.stdout.write('2.js\n')

  try {
    await waitForOutput('node3 received: car', 'node', [path.join(__dirname, '../2.js')], {
      cwd: __dirname,
      timeout: 2000
    })

    throw new Error('Matched content when should not have')
  } catch (err) {
    if (err.message !== 'Timed out' && !err.message.includes('Did not see')) {
      throw err
    }
  }
}
