# Chapter 04 - Protocol Creation

- Leverage the chat protocol at `./chat-protocol.js` to:
  1. Via `./index.js`, pass the `ChatProtocol` into the `App` view.
  1. In `../common/views/Chat.js` inside the `sendMessage` function, dial all peers in our peerbook and send them the message.
  1. In `../common/views/Chat.js` inside the `useEffect` function, register the handler for the `ChatProtocol`.
