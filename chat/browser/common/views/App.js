/* eslint-env browser */
import React, { useState, useEffect } from 'react'
import EventEmitter from 'events'
import Header from './Header'
import Metrics from './Metrics'
import Chat from './Chat'
import { getOrCreatePeerId } from '../libs/peer-id'
import '../styles/index.css'

export default function App ({
  createLibp2p,
  ChatProtocol
}) {
  const [peerId, setPeerId] = useState(null)
  const [libp2p, setLibp2p] = useState(null)
  const [started, setStarted] = useState(false)
  const eventBus = new EventEmitter()

  /**
   * Leverage use effect to act on state changes
   */
  useEffect(() => {
    // If we don't have a PeerId, let's get or create it
    // This will attempt to leverage localStorage so we can reuse our key
    if (!peerId) {
      console.info('Getting our PeerId')
      getOrCreatePeerId().then(setPeerId)
      return
    }

    // If the libp2p instance is not created, create it with our PeerId instance
    if (!libp2p) {
      ;(async () => {
        console.info('Creating our Libp2p instance')
        const node = await createLibp2p(peerId)
        setLibp2p(node)
        setStarted(true)
      })()
      return
    }
  })

  return (
    <div className='avenir flex flex-column h-100'>
      <div className='flex-none'>
        <Header started={started} />
      </div>
      <div className='flex h-100'>
        <Metrics libp2p={libp2p} eventBus={eventBus} />
        <Chat libp2p={libp2p} eventBus={eventBus} ChatProtocol={ChatProtocol} />
      </div>
    </div>
  )
}
