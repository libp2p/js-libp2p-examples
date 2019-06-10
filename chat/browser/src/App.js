/* eslint-env browser */
import React, { useState, useEffect } from 'react'
import Header from './Header'
import Metrics from './Metrics'
import Chat from './Chat'
import { getOrCreatePeerInfo } from './libs/peer-info'
import createLibp2p from './libs/libp2p'

export default function App () {
  const [peerInfo, setPeerInfo] = useState(null)
  const [libp2p, setLibp2p] = useState(null)
  const [started, setStarted] = useState(false)

  /**
   * Leverage use effect to act on state changes
   */
  useEffect(() => {
    // If we don't have a PeerInfo, let's get or create it
    // This will attempt to leverage localStorage so we can reuse our key
    if (!peerInfo) {
      console.info('Getting our PeerInfo')
      getOrCreatePeerInfo().then(setPeerInfo)
      return
    }

    // If the libp2p instance is not created, create it with our PeerInfo instance
    if (!libp2p) {
      console.info('Creating our Libp2p instance')
      setLibp2p(createLibp2p(peerInfo))
      return
    }

    // Start libp2p if it's not started and add some listeners
    if (!started) {
      console.info('Starting Libp2p')
      libp2p.on('start', () => setStarted(true))
      libp2p.on('stop', () => setStarted(false))

      libp2p.start()
      return
    }
  })

  return (
    <div className='avenir flex flex-column h-100'>
      <div className='flex-none'>
        <Header />
      </div>
      <div className='flex h-100'>
        <Metrics libp2p={libp2p} />
        <Chat libp2p={libp2p} />
      </div>
    </div>
  )
}