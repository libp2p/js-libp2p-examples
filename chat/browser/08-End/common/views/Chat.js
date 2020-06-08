import React, { useState, useEffect } from 'react'
import Message from './Message'

// Chat over Pubsub
import PubsubChat from '../../../common/libs/chat'

export default function Chat ({
  libp2p,
  eventBus
}) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [chatClient, setChatClient] = useState(null)
  const [peers, setPeers] = useState({})

  /**
   * Sends the current message in the chat field
   */
  const sendMessage = async () => {
    setMessage('')
    if (!message) return

    if (chatClient.checkCommand(message)) return

    try {
      await chatClient.send(message)
      console.info('Publish done')
    } catch (err) {
      console.error('Could not send message', err)
    }
  }

  /**
   * Calls `sendMessage` if enter was pressed
   * @param {KeyDownEvent} e
   */
  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      sendMessage()
    }
  }

  /**
   * Leverage use effect to act on state changes
   */
  useEffect(() => {
    // Wait for libp2p
    if (!libp2p) return

    // Create the pubsub chatClient
    if (!chatClient) {
      const pubsubChat = new PubsubChat(libp2p, PubsubChat.TOPIC)

      // Listen for messages
      pubsubChat.on('message', (message) => {
        if (message.from === libp2p.peerId.toB58String()) {
          message.isMine = true
        }
        setMessages((messages) => [...messages, message])
      })
      // Listen for peer updates
      pubsubChat.on('peer:update', ({ id, name }) => {
        setPeers((peers) => {
          const newPeers = { ...peers }
          newPeers[id] = { name }
          return newPeers
        })
      })
      // Forward stats events to the eventBus
      pubsubChat.on('stats', (stats) => eventBus.emit('stats', stats))

      setChatClient(pubsubChat)
    }
  })

  return (
    <div className='flex flex-column w-50 pa3 h-100 bl b--black-10'>
      <div className='w-100 flex-auto'>
        <ul className='list pa0'>
          {messages.map((message, index) => {
            return <Message peers={peers} message={message} key={message.message ? message.message.id : index} />
          })}
        </ul>
      </div>
      <div className='w-100 h-auto'>
        <input onChange={e => setMessage(e.target.value)} onKeyDown={(e) => onKeyDown(e)} className='f6 f5-l input-reset fl ba b--black-20 bg-white pa3 lh-solid w-100 w-75-m w-80-l br2-ns br--left-ns' type='text' name='send' value={message} placeholder='Type your message...' />
        <input onClick={() => sendMessage()} className='f6 f5-l button-reset fl pv3 tc bn bg-animate bg-black-70 hover-bg-black white pointer w-100 w-25-m w-20-l br2-ns br--right-ns' type='submit' value='Send' />
      </div>
    </div>
  )
}
