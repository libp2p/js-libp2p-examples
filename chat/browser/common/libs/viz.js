'use strict'

module.exports.layout = {
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
}

module.exports.style = [{
  selector: '.node-type-me', // ME
  style: {
    'background-color': '#791B89'
  }
}, {
  selector: '.node-type-2', // BROWSER
  style: {
    'background-color': '#E88900'
  }
}, {
  selector: '.node-type-1', // NODEJS
  style: {
    'background-color': '#A3AA12'
  }
}, {
  selector: '.node-type-0', // GO
  style: {
    'background-color': '#22616A'
  }
}, {
  selector: 'edge',
  style: {
    'width': 1,
    'line-color': '#ccc',
    'target-arrow-color': '#ccc'
  }
}]
