'use strict'
const pipe = require('it-pipe')

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
 * @param {Object} params
 * @param {Stream} params.stream A pull-stream based stream to the peer
 */
  return async ({ stream }) => {
    try {
      await pipe(
        stream,
        async function (source) {
          for await (const message of source) {
            setMessages((messages) => [...messages, message])
          }
        }
      )

      // Replies are done on new streams, so let's close this stream so we don't leak it
      await pipe([], stream)
    } catch (err) {
      console.error(err)
    }
  }
}

/**
 * Writes the `message` over the given `stream`
 *
 * @param {Buffer|String} message The message to send over `stream`
 * @param {PullStream} stream A stream over the muxed Connection to our peer
 * @param {function(func)} setMessages The react state update function for messages
 */
async function send (message, stream, setMessages) {
  try {
    await pipe(
      [message],
      stream,
      async function (source) {
        for await (const message of source) {
          setMessages((messages) => [...messages, String(message)])
        }
      }
    )
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  PROTOCOL,
  createHandler,
  send
}
