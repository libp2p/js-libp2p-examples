import React, { useState, useEffect } from 'react'
import Message from './Message'

// Chat over Pubsub
import PubsubChat from './libs/chat'

export default function Chat ({
  libp2p
}) {
  const [message, setMessage] = useState('')
  const [chats, setChatMessages] = useState([])
  const [chatClient, setChatClient] = useState(null)

  /**
   * Sends the current message in the chat field
   */
  const sendMessage = () => {
    setMessage('')
    if (chatClient.checkCommand(message)) return
    chatClient.send(message, (err) => {
      console.log('Publish done', err)
    })
  }

  /**
   * Calls `sendMessage` if enter was pressed
   * @param {KeyDownEvent} e
   */
  const onKeyDown = (e) => {
    if(e.keyCode == 13){
      sendMessage()
    }
  }

  /**
   * Leverage use effect to act on state changes
   */
  useEffect(() => {
    // Wait for libp2p
    if (!libp2p) return

    // Create the chat client
    if (!chatClient) {
      setChatClient(new PubsubChat(libp2p, PubsubChat.TOPIC, (chat) => {
        if (chat.from === libp2p.peerInfo.id.toB58String()) {
          chat.isMine = true
        }
        setChatMessages((chats) => [...chats, chat])
      }))
      setChatMessages([{
        "from": "QmThatOtherGuy",
        "message": {
          "id": "230gus1559671001159",
          "data": "I am a placeholder chat!",
          "created":1559669185178
        }
      }, {
        "from": "QmThatOtherGuy",
        "message": {
          "id": "230gus1559671001168",
          "data": "that's some fancy placeholding, I know.",
          "created":1559669186178
        }
      }])
    }
  })

  return (
    <div className="flex flex-column w-50 pa2 h-100 bl b--black-10">
      <div className="w-100 flex-auto">
        <ul className="list pa0">
          {chats.map((chat) => {
            return <Message chat={chat} key={chat.message.id} chatClient={chatClient} />
          })}
        </ul>
      </div>
      <div className="w-100 h-auto">
        <input onChange={e => setMessage(e.target.value)} onKeyDown={(e) => onKeyDown(e)} className="f6 f5-l input-reset fl ba b--black-20 bg-white pa3 lh-solid w-100 w-75-m w-80-l br2-ns br--left-ns" type="text" name="send" value={message} placeholder="Type your message..." />
        <input onClick={() => onSendClicked()} className="f6 f5-l button-reset fl pv3 tc bn bg-animate bg-black-70 hover-bg-black white pointer w-100 w-25-m w-20-l br2-ns br--right-ns" type="submit" value="Send" />
      </div>
    </div>
  )
}
