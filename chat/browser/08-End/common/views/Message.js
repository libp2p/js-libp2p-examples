import React from 'react'

/**
 * Message renderer
 * @param {object} param0
 */
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
