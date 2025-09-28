/* eslint-disable no-console */

import { lpStream } from '@libp2p/utils'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

export function stdinToStream (stream) {
  // Encode with length prefix (so receiving side knows how much data is coming)
  const lp = lpStream(stream)

  process.stdin.addListener('data', (buf) => {
    lp.write(buf)
  })
}

export function streamToConsole (stream) {
  const lp = lpStream(stream)

  Promise.resolve().then(async () => {
    while (true) {
      // Read from the stream
      const message = await lp.read()

      // Output the data as a utf8 string
      console.log('> ' + uint8ArrayToString(message.subarray()).replace('\n', ''))
    }
  })
}
