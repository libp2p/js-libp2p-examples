'use strict'
const pull = require('pull-stream')

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
 * @param {Object} protocol Contains a reference to the handlerFunc and matchFunc for the protocol
 * @param {Stream} stream A pull-stream based stream to the peer
 */
function handler (protocol, stream) {
  pull(
    stream,
    pull.collect((err, message) => {
      if (err) return console.error(err)
      console.info(String(message))

      // Auto reply on the same stream, this will also close the stream
      const randomReply = AutoReplies[Math.floor(Math.random() * AutoReplies.length)]
      send(randomReply, stream)
    })
  )
}

/**
 * Writes the `message` over the given `stream`. Any direct replies
 * will be written to the console.
 *
 * @param {Buffer|String} message The message to send over `stream`
 * @param {PullStream} stream A stream over the muxed Connection to our peer
 */
function send (message, stream) {
  pull(
    pull.values([ message ]),
    stream,
    pull.collect((err, message) => {
      if (err) return console.error(err)
      if (message) console.info(String(message))
    })
  )
}

module.exports = {
  PROTOCOL,
  handler,
  send
}
