/* eslint-env browser */
import React, { useState, useEffect } from 'react'

export default function Metrics ({
  libp2p
}) {
  const [listening, setListening] = useState(false)
  const [peerCount, setPeerCount] = useState(0)
  const [peersConnected, setPeersConnected] = useState(0)

  /**
   * Leverage use effect to act on state changes
   */
  useEffect(() => {
    // Wait for libp2p
    if (!libp2p) return

    // Set up listeners for setting metrics
    if (!listening) {
      libp2p.on('peer:connect', (peerInfo) => {
        console.info(`Connected to ${peerInfo.id.toB58String()}`)
        const num = libp2p.peerBook.getAllArray().filter(addr => !!addr.isConnected()).length
        setPeersConnected(num)
      })
      libp2p.on('peer:disconnect', (peerInfo) => {
        console.info(`Disconnected from ${peerInfo.id.toB58String()}`)
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
      setListening(true)
      return
    }
  })

  return (
    <div className="flex flex-column w-25 pa3 h-100">
      <p>Peers Known: {peerCount}</p>
      <p>Peers Connected: {peersConnected}</p>
    </div>
  )
}