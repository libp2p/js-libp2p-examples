/* eslint-env browser */
import React, { useState, useEffect } from 'react'
import Header from './Header'
import Chat from './Chat'
import { getOrCreatePeerInfo } from './libs/peer-info'
import createLibp2p from './libs/libp2p-bundle'
import multiaddr from 'multiaddr'
import pull from 'pull-stream'

import ChatClient from './libs/chat'
const TOPIC = '/libp2p/chat/ipfs-camp/2019'

export default function App () {
  const [message, setMessage] = useState('')
  const [peerInfo, setPeerInfo] = useState(null)
  const [libp2p, setLibp2p] = useState(null)
  const [started, setStarted] = useState(false)
  const [peerCount, setPeerCount] = useState(0)
  const [peersConnected, setPeersConnected] = useState(0)
  const [chats, setChats] = useState([{
    "from": "QmThatOtherGuy",
    "message": {
      "id": "230gus1559671001159",
      "data": "Well hello there!",
      "created":1559669185178
    }
  }])
  const [chat, setChat] = useState(null)

  const sendMessage = () => {
    setMessage('')
    chat.send(message, (err) => {
      console.log('Publish done', err)
    })
  }

  useEffect(() => {
    if (!peerInfo) {
      console.info('Getting our PeerInfo')
      getOrCreatePeerInfo().then(setPeerInfo)
      return
    }

    if (!libp2p) {
      console.info('Creating our Libp2p instance')
      setLibp2p(createLibp2p(peerInfo))
      return
    }

    if (!started) {
      console.info('Starting Libp2p')
      libp2p.on('start', () => setStarted(true))
      libp2p.on('stop', () => setStarted(false))
      libp2p.on('peer:connect', (peerInfo) => {
        console.info(`Connected to ${peerInfo.id.toB58String()}`)
        const num = libp2p.peerBook.getAllArray().filter(addr => !!addr.isConnected()).length
        setPeersConnected(num)
      })
      libp2p.on('peer:discovery', (peerInfo) => {
        console.info(`Discovered peer ${peerInfo.id.toB58String()}`)
        peerInfo.multiaddrs.forEach(addr => {
          console.info(`\t${addr.toString()}`)
        })
        setPeerCount(libp2p.peerBook.getAllArray().length)
      })

      libp2p.start()
      return
    }

    if (!chat) {
      setChat(new ChatClient(libp2p, TOPIC, (chat) => {
        console.log('Chats', chats)
        console.log('Chat', chat)
        setChats([...chats, chat])
      }))
    }

    // libp2p.dialProtocol(multiaddr('/ip4/127.0.0.1/tcp/63786/ws/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d'), '/libp2p/chat/1.0.0', (err, conn) => {
    //   if (err) return console.error(err)
    //   pull(
    //     pull.values([Buffer.from('hi there')]),
    //     conn,
    //     pull.collect((err, values) => {
    //       if (err) return console.error(err)
    //       values.forEach(buf => console.info(`Got response: ${buf.toString()}`))
    //     })
    //   )
    // })
  })

  return (
    <div className='avenir flex flex-column h-100'>
      <div className='flex-none'>
        <Header />
      </div>
      <div className='flex'>

      </div>
      <div className='flex h-100'>
        <div className="flex flex-column w-50 pa2 h-100">
          <p>Peers Known: {peerCount}</p>
          <p>Peers Connected: {peersConnected}</p>
        </div>
        <Chat
          chats={chats}
          message={message}
          onMessageChange={setMessage}
          onSendClicked={sendMessage}
        />
      </div>
    </div>
  )
}