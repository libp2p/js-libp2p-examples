'use strict'
const pipe = require('it-pipe')

// Define the codec of our chat protocol
const PROTOCOL = '/libp2p/chat/1.0.0'

const AutoReplies = [
  'You tell the best stories!',
  'Did you know Im actually a robot?',
  'Speaking of... did you ever see that movie Splash? Mermaids are neat.',
  'this is my favorite chat',
  'i hope there are muffins to eat on the break, im hungry',
  'doo doo deee, we\'re sorry, the number you dialed cannot be reached',
  'remember the sound of dial up internet? they should bring that back',
  'how do you feel about Go? JS is way cooler am i right?!',
  'I was wondering when you were going to call',
  'that is really neat',
  'beep bop boop'
]

/**
 * A simple handler to print incoming messages to the console
 * @param {Object} params
 * @param {Connection} params.connection The connection the stream belongs to
 * @param {Stream} params.stream A stream to the peer
 */
async function handler ({ connection, stream }) {
  try {
    await pipe(
      stream,
      (source) => (async function * () {
        for await (const message of source) {
          console.info(`${connection.remotePeer.toB58String().slice(0, 8)}: ${String(message)}`)

          // Auto reply on the same stream
          yield AutoReplies[Math.floor(Math.random() * AutoReplies.length)]
        }
      })(),
      stream
    )
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
          console.info(String(message))
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
