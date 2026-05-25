import path from 'path'
import { fileURLToPath } from 'url'
import { matchOutput } from 'test-ipfs-example/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function test () {
  process.stdout.write('2.js\n')

  // run until node3 receives the last valid fruit - this fails if a valid fruit
  // never propagates node1 -> node2 -> node3
  const { process: proc, matches } = await matchOutput(/node3 received: orange/, 'node', [path.join(__dirname, '../2.js')], {
    cwd: __dirname
  })
  proc.kill()

  // 'car' fails validation, so node2 never re-shares it - it must be absent
  // from everything printed up to the final valid message
  if (matches.input.includes('node3 received: car')) {
    throw new Error("node3 should not have received 'car'")
  }
}
