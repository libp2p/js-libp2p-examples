import path from 'path'
import { fileURLToPath } from 'url'
import pDefer from 'p-defer'
import { matchOutput } from 'test-ipfs-example/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const messageReceived = pDefer()
const message = 'test message'

// Step 1 process
process.stdout.write('node listener.js\n')

const {
  process: listener
} = await matchOutput(/Listener ready, listening on/g, 'node', [path.resolve(__dirname, '../src/listener.js')])

// receive message
listener.stdout.addListener('data', (buf) => {
  if (buf.toString().includes(message)) {
    messageReceived.resolve()
  }
})

process.stdout.write('==================================================================\n')

// Step 2 process
process.stdout.write('node dialer.js\n')

const {
  process: dialer
} = await matchOutput(/Type a message and see what happens/g, 'node', [path.resolve(__dirname, '../src/dialer.js')])

// send message
dialer.stdin.write(message)
dialer.stdin.write('\n')

process.stdout.write('==================================================================\n')

await messageReceived.promise

process.stdout.write('chat message received\n')

dialer.kill()
listener.kill()
