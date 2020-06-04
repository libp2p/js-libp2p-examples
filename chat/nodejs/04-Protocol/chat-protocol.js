'use strict'
const pipe = require('it-pipe')

// Define the codec of our chat protocol
const PROTOCOL = '/libp2p/chat/1.0.0'

/**
 * A simple handler to print incoming messages to the console
 * @param {Object} params
 * @param {Connection} params.connection The connection the stream belongs to
 * @param {Stream} params.stream A pull-stream based stream to the peer
 */
async function handler ({ connection, stream }) {
  try {
    await pipe(
      stream,
      async function (source) {
        for await (const message of source) {
          console.info(`${connection.remotePeer.toB58String().slice(0, 8)}: ${String(message)}`)
        }
      }
    )

    // Replies are done on new streams, so let's close this stream so we don't leak it
    await pipe([], stream)
  } catch (err) {
    console.error(err)
  }
}

/**
 * Writes the `message` over the given `stream`. Any direct replies
 * will be written to the console.
 *
 * @param {Buffer|String} message The message to send over `stream`
 * @param {PullStream} stream A stream over the muxed Connection to our peer
 */
async function send (message, stream) {
  try {
    await pipe(
      [ message ],
      stream,
      async function (source) {
        for await (const message of source) {
          console.info(`Me: ${String(message)}`)
        }
      }
    )
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  PROTOCOL,
  handler,
  send
}
