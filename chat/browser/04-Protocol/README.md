# Chapter 04 - Protocol Creation

- Leverage the chat protocol at `./chat-protocol.js` to:
  1. In `../common/views/Chat.js` inside the `sendMessage` function, dial all peers in our peerbook and send them the message.
    1. Use `libp2p.peerBook.getAllArray()` to get an array of all `PeerInfo` instances we know.
    1. Use `peerInfo.isConnected()` to **only** send messages to peers we are connected to.
    1. Use `Chat.send(PeerInfo, message, setMessages)` to send the message to a given peer and log any error that's returned.
  1. In `../common/views/Chat.js` inside the `useEffect` function, register the handler for the `ChatProtocol`.
    1. Register the handler via `libp2p.handle(String, Function)`
    1. You can create the handler function via `ChatProtocol.createHandler(setMessages)`
