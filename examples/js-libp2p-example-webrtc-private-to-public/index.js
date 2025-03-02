/* eslint-disable linebreak-style */
/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webRTCDirect } from '@libp2p/webrtc'
import { multiaddr } from '@multiformats/multiaddr'
import { pipe } from 'it-pipe'
import { createLibp2p } from 'libp2p'
import { fromString, toString } from 'uint8arrays'

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
      status: document.getElementById('status'),
      output: document.getElementById('output'),
      peer: document.getElementById('peer'),
      connect: document.getElementById('connect'),
      appendOutput: (line) => {
        const div = document.createElement('div')
        div.appendChild(document.createTextNode(line))
        elements.output?.appendChild(div)
      }
    }
  : {}

async function createNode () {
  try {
    if (isBrowser) {
      try {
        return await createLibp2p({
          transports: [webRTCDirect()],
          connectionEncryption: [noise()],
          streamMuxers: [yamux()]
        })
      } catch (error) {
        console.log(`Failed to create private node: ${error.message}`)
        return null
      }
    } else {
      try {
        return await createLibp2p({
          addresses: {
            listen: ['/ip4/127.0.0.1/tcp/4001/webrtc-direct', '/ip4/192.168.0.5/tcp/4001/webrtc-direct']
          },
          transports: [webRTCDirect()],
          connectionEncryption: [noise()],
          streamMuxers: [yamux()]
        })
      } catch (error) {
        console.log(`Failed to create public node: ${error.message}`)
        return null
      }
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
  const publicPeerAddr = document.getElementById('peer').value
  if (!publicPeerAddr) return

  ma = multiaddr(publicPeerAddr)
  node.dial(ma)
    .then(() => {
      elements.status.textContent = `Connected to ${publicPeerAddr}`
      updateStatus(`Connected to ${publicPeerAddr}`, 'green')
      setupMessaging()
    })
    .catch(error => updateStatus(`Failed to dial peer: ${error.message}`, 'red'))
}

if (elements.connect) {
  elements.connect.addEventListener('click', async () => {
    console.log('connect clicked')
    ma = multiaddr(elements.peer.value)
    elements.appendOutput(`Dialing '${ma}'`)

    const signal = AbortSignal.timeout(5000)

    try {
      await node.dial(ma, {
        signal
      })
      elements.appendOutput(`Connected to '${ma}'`)
    } catch (err) {
      if (signal.aborted) {
        elements.appendOutput(`Timed out connecting to '${ma}'`)
      } else {
        elements.appendOutput(`Connecting to '${ma}' failed - ${err.message}`)
      }
    }
  })
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
