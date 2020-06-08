/* eslint-env browser */
import React, { useState, useEffect, createRef } from 'react'
import cytoscape from 'cytoscape'
import euler from 'cytoscape-euler'
import { layout, style } from '../../../common/libs/viz'

function Graph ({
  graphRoot
}) {
  return (
    <div ref={graphRoot} className='bg-snow-muted h-100' />
  )
}

export default function Metrics ({
  libp2p,
  eventBus
}) {
  const [listening, setListening] = useState(false)
  const [peerCount, setPeerCount] = useState(0)
  const [stats, setStats] = useState(new Map())
  const _graphRoot = createRef()
  cytoscape.use(euler)

  /**
   * Leverage use effect to act on state changes
   */
  useEffect(() => {
    // Wait for libp2p
    if (!libp2p) return

    // Set up listeners for setting metrics
    if (!listening) {
      eventBus.on('stats', (stats) => {
        setStats(stats)
      })

      libp2p.peerStore.on('peer', (peerId) => {
        const num = libp2p.peerStore.peers.size
        setPeerCount(num)
      })

      setListening(true)
      return
    }

    const nodes = {}
    const edges = []
    Array.from(stats).forEach(([peerId, stat], index) => {
      let { connectedPeers, nodeType } = stat
      if (peerId === libp2p.peerId.toB58String()) {
        nodeType = 'me'
      }
      const classname = `node-type-${nodeType}`

      nodes[peerId] = {
        data: { id: peerId },
        classes: classname
      }

      connectedPeers.forEach(peer => {
        peer = peer.toString()
        if (!nodes[peer]) {
          nodes[peer] = {
            data: { id: peer }
          }
        }

        edges.push({
          data: {
            id: `${peerId}-${peer}`,
            source: peerId,
            target: peer
          }
        })
      })
    })

    const cy = cytoscape({
      elements: [
        ...Object.values(nodes),
        ...edges
      ],
      container: _graphRoot.current,
      style
    })
    cy.layout(layout).run()
  })

  return (
    <div className='flex flex-column w-50 pa3 h-100'>
      <div className='dt dt--fixed w-100'>
        <p className='dtc'><span className='dot bg-libp2p-dark-purple' /> Me</p>
        <p className='dtc'><span className='dot bg-libp2p-dark-aqua' /> Go</p>
        <p className='dtc'><span className='dot bg-libp2p-dark-orange' /> Browser</p>
        <p className='dtc'><span className='dot bg-libp2p-dark-green' /> Node.js</p>
        <p className='dtc'><span className='dot' /> Unknown</p>
      </div>
      <h3>Peers Known: {peerCount}</h3>
      <Graph graphRoot={_graphRoot} />
    </div>
  )
}
