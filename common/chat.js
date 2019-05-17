const protons = require('protons')

const { Message } = protons(`
message Message {
  optional bytes data = 1;
  optional int64 created = 2;
}
`)

class Chat {
  /**
   *
   * @param {Libp2p} libp2p A Libp2p node to communicate through
   * @param {string} topic The topic to subscribe to
   * @param {function(Message)} messageHandler Called with every `Message` received on `topic`
   */
  constructor(libp2p, topic, messageHandler) {
    this.libp2p = libp2p
    this.topic = topic
    this.messageHandler = messageHandler
    this.libp2p.on('start', this.onStart.bind(this))
    this.libp2p.on('stop', this.onStop.bind(this))
  }

  onStart () {
    this.join()
  }

  onStop () {
    // TODO: Do we need to do anything here?
  }

  /**
   * Subscribes to `Chat.topic`. All messages will be
   * forwarded to `messageHandler`
   * @private
   */
  join () {
    this.libp2p.pubsub.subscribe(this.topic, null, (message) => {
      try {
        const msg = Message.decode(message.data)
        this.messageHandler({
          from: message.from,
          message: msg
        })
      } catch (err) {
        console.error(err)
      }
    }, (err) => {
      console.log(`Subscribed to ${this.topic}`, err)
    })
  }

  /**
   * Unsubscribes from `Chat.topic`
   * @private
   */
  leave () {
    this.libp2p.pubsub.unsubscribe(this.topic)
  }

  /**
   *
   * @param {Buffer|string} message The chat message to send
   * @param {function(Error)} callback Called once the publish is complete
   */
  send (message, callback) {
    const msg = Message.encode({
      data: Buffer.from(message),
      created: Date.now()
    })

    console.log('Send:', msg)

    this.libp2p.pubsub.publish(this.topic, msg, (err) => {
      if (err) return callback(err)
      callback()
    })
  }
}

module.exports = Chat
