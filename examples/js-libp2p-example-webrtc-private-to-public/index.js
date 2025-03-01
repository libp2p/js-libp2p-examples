/* eslint-disable linebreak-style */
/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webRTCDirect } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { multiaddr } from '@multiformats/multiaddr'
import { pipe } from 'it-pipe'
import { createLibp2p } from 'libp2p'
import { fromString, toString } from 'uint8arrays'

// const output = document.getElementById('output')
// const appendOutput = (line) => {
//   const div = document.createElement('div')
//   div.appendChild(document.createTextNode(line))
//   output.append(div)
// }
// const WEBRTC_CODE = protocols('webrtc').code

const isBrowser = typeof window !== 'undefined'
let node, conn, ma
const elements = isBrowser
  ? {
      sendSection: document.getElementById('send-section'),
      messageBox: document.getElementById('messages'),
      sendButton: document.getElementById('send'),
      inputField: document.getElementById('messageInput'),
      connections: document.getElementById('connections'),
      multiaddrs: document.getElementById('multiaddrs'),
      status: document.getElementById('status')
    }
  : {}

async function createNode () {
  try {
    if (isBrowser) {
      return await createLibp2p({
        transports: [webRTCDirect()],
        connectionEncryption: [noise()],
        streamMuxers: [yamux()]
      })
    } else {
      return await createLibp2p({
        addresses: {
          listen: ['/ip4/0.0.0.0/tcp/4001/ws']
        },
        transports: [webSockets({
          filter: filters.all
        })],
        connectionEncryption: [noise()],
        streamMuxers: [yamux()]
      })
    }
  } catch (error) {
    console.log(`Failed to create node: ${error.message}`)
    return null
  }
}

async function start () {
  node = await createNode()
  if (!node) return

  try {
    await node.start()
    console.log('Node started! Peer ID:', node.peerId.toString())
    node.getMultiaddrs().forEach(addr => console.log('Listening on:', addr.toString()))
    updateStatus(`Node started! Peer ID: ${node.peerId.toString()}`, 'green')
    if (isBrowser) {
      elements.status.textContent = `Node started! Peer ID: ${node.peerId.toString()}`
    }
  } catch (error) {
    console.log(`Failed to start node: ${error.message}`)
    return
  }

  if (isBrowser) {
    connectToPublicPeer()
  } else {
    console.log('Running as public peer (Node.js)')
    node.getMultiaddrs().forEach(addr => console.log('Listening on:', addr.toString()))
  }
}

function connectToPublicPeer () {
  // eslint-disable-next-line no-alert
  const publicPeerAddr = window.prompt('Enter public peer multiaddr:')
  if (!publicPeerAddr) return

  ma = multiaddr(publicPeerAddr)
  node.dial(ma)
    .then(() => {
      elements.status.textContent = `Connected to ${publicPeerAddr}`
      setupMessaging()
    })
    .catch(error => updateStatus(`Failed to dial peer: ${error.message}`, 'red'))
}

function setupMessaging () {
  elements.sendButton.addEventListener('click', async () => {
    const message = elements.inputField.value
    if (!message || !conn) return

    try {
      const { stream } = await conn.newStream(['/chat/1.0.0'])
      await pipe([fromString(message)], stream.sink)
      appendMessage(`You: ${message}`)
      elements.inputField.value = ''
    } catch (error) {
      console.error(`Error sending message: ${error.message}`)
    }
  })

  node.handle('/chat/1.0.0', async ({ stream }) => {
    try {
      await pipe(stream.source, async function (source) {
        for await (const msg of source) {
          appendMessage(`Peer: ${toString(msg)}`)
        }
      })
    } catch (error) {
      console.error(`Error receiving message: ${error.message}`)
    }
  })
}

function appendMessage (text) {
  const messageElement = document.createElement('p')
  messageElement.textContent = text
  elements.messageBox.appendChild(messageElement)
}

function updateStatus (text, color = 'black') {
  if (elements.status) {
    elements.status.textContent = text
    elements.status.style.color = color
  }
}

if (isBrowser) {
  document.addEventListener('DOMContentLoaded', () => {
    start().catch(console.error)
  })
} else {
  start().catch(console.error)
}
