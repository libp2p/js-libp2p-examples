# Chapter 06 - Chat over Pubsub

- Turn pubsub on in the libp2p config
- Using the `Chat.js` view provided in [../common/views/Chat.js](../common/views/Chat.js), make chat run over pubsub
- Remove the chat protocol code we've been using in the previous chapters
- Replace the `export` of [../common/views/Message.js](../common/views/Message.js) with the following render code:

**Message.js**

```js
export default function Message ({ peers, message }) {
  const from = peers[message.from] ? peers[message.from].name : message.from.substring(0, 20)

  return (
    <li>
      <div className={"chat-body " + (message.isMine ? "right" : "")}>
        <div className="chat-header">
          <strong className="chat-name">{from}</strong>
          <small className="chat-time">{new Date(message.created).toLocaleTimeString()}</small>
        </div>
        <p>{message.data.toString()}</p>
      </div>
    </li>
  )
}
```