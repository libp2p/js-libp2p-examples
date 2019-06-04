const protons = require('protons')

const { Request } = protons(`
message Request {
  enum Type {
    SEND_MESSAGE = 0;
    UPDATE_PEER = 1;
  }

  required Type type = 0;
  optional SendMessage sendMessage = 1;
  optional UpdatePeer updatePeer = 2;
}

message SendMessage {
  required bytes data = 0;
  required int64 created = 1;
  required bytes id = 2;
}

message UpdatePeer {
  optional bytes userHandle = 0;
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

    // Join if libp2p is already on
    if (this.libp2p.isStarted()) this.join()
  }

  /**
   * Handler that is run when `this.libp2p` starts
   */
  onStart () {
    this.join()
  }

  /**
   * Handler that is run when `this.libp2p` stops
   */
  onStop () {
    this.leave()
  }

  /**
   * Subscribes to `Chat.topic`. All messages will be
   * forwarded to `messageHandler`
   * @private
   */
  join () {
    this.libp2p.pubsub.subscribe(this.topic, null, (message) => {
      try {
        const request = Request.decode(message.data)
        switch (request.type) {
          case Request.Type.UPDATE_PEER:
            // TODO: Add username update
          default:
            this.messageHandler({
              from: message.from,
              message: request.sendMessage
            })
        }
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
    const msg = Request.encode({
      type: Request.Type.SEND_MESSAGE,
      sendMessage: {
        id: (~~(Math.random() * 1e9)).toString(36) + Date.now(),
        data: Buffer.from(message),
        created: Date.now()
      }
    })

    this.libp2p.pubsub.publish(this.topic, msg, (err) => {
      if (err) return callback(err)
      callback()
    })
  }
}

module.exports = Chat
