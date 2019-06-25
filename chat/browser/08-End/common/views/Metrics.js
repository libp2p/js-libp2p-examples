/* eslint-env browser */
import React, { useState, useEffect, createRef } from 'react'
import cytoscape from 'cytoscape'
import euler from 'cytoscape-euler'

let defaults = {
  name: 'euler',

  // The ideal length of a spring
  // - This acts as a hint for the edge length
  // - The edge length can be longer or shorter if the forces are set to extreme values
  springLength: edge => 80,

  // Hooke's law coefficient
  // - The value ranges on [0, 1]
  // - Lower values give looser springs
  // - Higher values give tighter springs
  springCoeff: edge => 0.0008,

  // The mass of the node in the physics simulation
  // - The mass affects the gravity node repulsion/attraction
  mass: node => 4,

  // Coulomb's law coefficient
  // - Makes the nodes repel each other for negative values
  // - Makes the nodes attract each other for positive values
  gravity: -1.2,

  // A force that pulls nodes towards the origin (0, 0)
  // Higher values keep the components less spread out
  pull: 0.001,

  // Theta coefficient from Barnes-Hut simulation
  // - Value ranges on [0, 1]
  // - Performance is better with smaller values
  // - Very small values may not create enough force to give a good result
  theta: 0.666,

  // Friction / drag coefficient to make the system stabilise over time
  dragCoeff: 0.02,

  // When the total of the squared position deltas is less than this value, the simulation ends
  movementThreshold: 1,

  // The amount of time passed per tick
  // - Larger values result in faster runtimes but might spread things out too far
  // - Smaller values produce more accurate results
  timeStep: 20,

  // The number of ticks per frame for animate:true
  // - A larger value reduces rendering cost but can be jerky
  // - A smaller value increases rendering cost but is smoother
  refresh: 10,

  // Whether to animate the layout
  // - true : Animate while the layout is running
  // - false : Just show the end result
  // - 'end' : Animate directly to the end result
  animate: true,

  // Animation duration used for animate:'end'
  animationDuration: undefined,

  // Easing for animate:'end'
  animationEasing: undefined,

  // Maximum iterations and time (in ms) before the layout will bail out
  // - A large value may allow for a better result
  // - A small value may make the layout end prematurely
  // - The layout may stop before this if it has settled
  maxIterations: 1000,
  maxSimulationTime: 4000,

  // Prevent the user grabbing nodes during the layout (usually with animate:true)
  ungrabifyWhileSimulating: false,

  // Whether to fit the viewport to the repositioned graph
  // true : Fits at end of layout for animate:false or animate:'end'; fits on each frame for animate:true
  fit: true,

  // Padding in rendered co-ordinates around the layout
  padding: 30,

  // Constrain layout bounds with one of
  // - { x1, y1, x2, y2 }
  // - { x1, y1, w, h }
  // - undefined / null : Unconstrained
  boundingBox: undefined,

  // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
  ready: function(){}, // on layoutready
  stop: function(){}, // on layoutstop

  // Whether to randomize the initial positions of the nodes
  // true : Use random positions within the bounding box
  // false : Use the current node positions as the initial positions
  randomize: false
};

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
  const [peersConnected, setPeersConnected] = useState(0)
  const [stats, setStats] = useState(new Map())
  let _graphRoot = createRef()
  cytoscape.use( euler )

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

      libp2p.on('peer:connect', (peerInfo) => {
        const num = libp2p.peerBook.getAllArray().filter(addr => !!addr.isConnected()).length
        setPeersConnected(num)
      })
      libp2p.on('peer:disconnect', (peerInfo) => {
        const num = libp2p.peerBook.getAllArray().filter(addr => !!addr.isConnected()).length
        setPeersConnected(num)
      })

      setListening(true)
      return
    }

    let nodes = {}
    let edges = []
    Array.from(stats).forEach(([peerId, stat], index) => {
      let { connectedPeers, nodeType } = stat
      if (peerId === libp2p.peerInfo.id.toB58String()) {
        nodeType = 'me'
      }
      let classname = `node-type-${nodeType}`

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
      style: [{
        selector: '.node-type-me', // ME
        style: {
          'background-color': 'red'
        }
      }, {
        selector: '.node-type-2', // BROWSER
        style: {
          'background-color': 'orange'
        }
      }, {
        selector: '.node-type-1', // NODEJS
        style: {
          'background-color': 'green'
        }
      }, {
        selector: '.node-type-0', // GO
        style: {
          'background-color': 'red'
        }
      }, {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc'
        }
      }]
    })
    cy.layout( defaults ).run()
  })

  return (
    <div className="flex flex-column w-50 pa3 h-100">
      <p>Peers Known: {peerCount}</p>
      <p>Peers Connected: {peersConnected}</p>
      <Graph graphRoot={_graphRoot} />
    </div>
  )
}