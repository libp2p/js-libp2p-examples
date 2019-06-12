import React from 'react'

/**
 * Message renderer
 * @param {object} param0
 */
export default function Message ({ peers, chat }) {
  const from = peers[chat.from] ? peers[chat.from].name : chat.from.substring(0, 20)

  return (
    <li>
      <div className={"chat-body " + (chat.isMine ? "right" : "")}>
        <div className="chat-header">
          <strong className="chat-name">{from}</strong>
          <small className="chat-time">{new Date(chat.message.created).toLocaleTimeString()}</small>
        </div>
        <p>{chat.message.data.toString()}</p>
      </div>
    </li>
  )
}
