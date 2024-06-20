import path from 'path'
import { fileURLToPath } from 'url'
import { execa } from 'execa'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let discoveredNodes = 0

process.stdout.write('2.js\n')

const proc = execa('node', [path.join(__dirname, '..', '2-mdns.js')], {
  cwd: path.resolve(__dirname),
  all: true
})

proc.all.on('data', async (data) => {
  process.stdout.write(data)
  const str = uint8ArrayToString(data)

  str.split('\n').forEach(line => {
    if (line.includes('Discovered:')) {
      discoveredNodes++
    }
  })
})

await pWaitFor(() => discoveredNodes > 1, 600000)

process.exit(0)
