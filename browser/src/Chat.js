import React from 'react'

export function Message ({ chat }) {
  return (
    <li>{chat.from.substring(0, 8)}({new Date(chat.message.created).toLocaleTimeString()}): {chat.message.data.toString()}</li>
  )
}

export default function Chat ({
  chats,
  message,
  onMessageChange,
  onSendClicked
}) {
  return (
    <div className="flex flex-column w-50 pa2 h-100 bl b--black-10">
      <div className="w-100 flex-auto">
        <ul className="list">
          {chats.map((chat) =>
            <Message chat={chat} key={chat.message.id} />
          )}
        </ul>
      </div>
      <div className="w-100 h-auto">
        <input onChange={e => onMessageChange(e.target.value)} className="f6 f5-l input-reset fl ba b--black-20 bg-white pa3 lh-solid w-100 w-75-m w-80-l br2-ns br--left-ns" type="text" name="send" value={message} placeholder="Type your message..." />
        <input onClick={() => onSendClicked()} className="f6 f5-l button-reset fl pv3 tc bn bg-animate bg-black-70 hover-bg-black white pointer w-100 w-25-m w-20-l br2-ns br--right-ns" type="submit" value="Send" />
      </div>
    </div>
  )
}
