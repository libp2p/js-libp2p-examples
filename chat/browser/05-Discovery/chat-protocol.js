'use strict'
const pull = require('pull-stream')

// Define the codec of our chat protocol
const PROTOCOL = '/libp2p/chat/1.0.0'

/**
 * Returns the chat protocol handler that will use the provided
 * `setMessages` useEffect function to update the UI
 *
 * @param {function(func)} setMessages The react state update function for messages
 * @returns {function} The protocol handler
 */
function createHandler (setMessages) {
  /**
   * A simple handler to print incoming messages to the console
   * @param {Object} protocol Contains a reference to the handlerFunc and matchFunc for the protocol
   * @param {Stream} stream A pull-stream based stream to the peer
   */
  return (protocol, stream) => {
    pull(
      stream,
      pull.collect((err, message) => {
        if (err) return console.log(err)

        // Add the new message to the existing list of messages
        setMessages((messages) => [...messages, message])

        // Replies are done on new streams, so let's close this stream so we don't leak it
        pull(
          pull.empty(),
          stream
        )
      })
    )
  }
}

/**
 * Writes the `message` over the given `stream`
 *
 * @param {Buffer|String} message The message to send over `stream`
 * @param {PullStream} stream A stream over the muxed Connection to our peer
 * @param {function(func)} setMessages The react state update function for messages
 */
function send (message, stream, setMessages) {
  pull(
    pull.values([ message ]),
    stream,
    pull.collect((err, message) => {
      if (err) return console.error(err)
      setMessages((messages) => [...messages, String(message)])
    })
  )
}

module.exports = {
  PROTOCOL,
  createHandler,
  send
}
