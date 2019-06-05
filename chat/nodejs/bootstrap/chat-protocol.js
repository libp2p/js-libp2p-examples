'use strict'
const pull = require('pull-stream')

// Define the codec of our chat protocol
const PROTOCOL = '/libp2p/chat/1.0.0'

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
    })
  )
}

/**
 * Writes the `message` over the given `stream`
 *
 * @param {Buffer|String} message The message to send over `stream`
 * @param {PullStream} stream A stream over the muxed Connection to our peer
 */
function send (message, stream) {
  pull(
    pull.values([ message ]),
    stream
  )
}

module.exports = {
  PROTOCOL,
  handler,
  send
}
