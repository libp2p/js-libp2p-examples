const protons = require('protons')

const { Request } = protons(`
message Request {
  enum Type {
    SEND_MESSAGE = 0;
    UPDATE_PEER = 1;
  }

  required Type type = 1;
  optional SendMessage sendMessage = 2;
  optional UpdatePeer updatePeer = 3;
}

message SendMessage {
  required bytes data = 1;
  required int64 created = 2;
  required bytes id = 3;
}

message UpdatePeer {
  optional bytes userHandle = 1;
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
    this.userHandles = new Map([
      [libp2p.peerInfo.id.toB58String(), 'Me']
    ])

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
              const newHandle = request.updatePeer.userHandle.toString()
              console.info(`System: ${message.from} is now ${newHandle}.`)
              this.userHandles.set(message.from, newHandle)
            break
          default:
            this.messageHandler({
              from: message.from,
              ...request.sendMessage
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
   * Crudely checks the input for a command. If no command is
   * found `false` is returned. If the input contains a command,
   * that command will be processed and `true` will be returned.
   * @param {Buffer|string} input Text submitted by the user
   * @returns {boolean} Whether or not there was a command
   */
  checkCommand (input) {
    const str = input.toString()
    if (str.startsWith('/')) {
      const args = str.slice(1).split(' ')
      switch (args[0]) {
        case 'name':
          this.updatePeer(args[1])
          return true
      }
    }
    return false
  }

  updatePeer (name) {
    const msg = Request.encode({
      type: Request.Type.UPDATE_PEER,
      updatePeer: {
        userHandle: Buffer.from(name)
      }
    })

    this.libp2p.pubsub.publish(this.topic, msg, (err) => {
      if (err) return console.error('Could not publish name change')
    })
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
module.exports.TOPIC = '/libp2p/example/chat/1.0.0'
module.exports.CLEARLINE = '\033[1A'
