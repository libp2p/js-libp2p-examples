import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify, identifyPush } from '@libp2p/identify'
import { ping } from '@libp2p/ping'
import { webRTC } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { multiaddr, protocols } from '@multiformats/multiaddr'
import { byteStream } from 'it-byte-stream'
import { createLibp2p } from 'libp2p'
import { fromString, toString } from 'uint8arrays'

const WEBRTC_CODE = protocols('webrtc').code

const output = document.getElementById('output')
const sendSection = document.getElementById('send-section')
const appendOutput = (line) => {
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(line))
  output.append(div)
}
const CHAT_PROTOCOL = '/libp2p/examples/chat/1.0.0'
let ma
let chatStream

const node = await createLibp2p({
  addresses: {
    listen: [
      '/p2p-circuit',
      '/webrtc'
    ]
  },
  transports: [
    webSockets({
      filter: filters.all
    }),
    webRTC(),
    circuitRelayTransport()
  ],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  connectionGater: {
    denyDialMultiaddr: () => {
      // by default we refuse to dial local addresses from the browser since they
      // are usually sent by remote peers broadcasting undialable multiaddrs but
      // here we are explicitly connecting to a local node so do not deny dialing
      // any discovered address
      return false
    }
  },
  services: {
    identify: identify(),
    identifyPush: identifyPush(),
    ping: ping()
  }
})

await node.start()

function updateConnList () {
  // Update connections list
  const connListEls = node.getConnections()
    .map((connection) => {
      if (connection.remoteAddr.protoCodes().includes(WEBRTC_CODE)) {
        ma = connection.remoteAddr
        sendSection.style.display = 'block'
      }

      const el = document.createElement('li')
      el.textContent = connection.remoteAddr.toString()
      return el
    })
  document.getElementById('connections').replaceChildren(...connListEls)
}

node.addEventListener('connection:open', (event) => {
  updateConnList()
})
node.addEventListener('connection:close', (event) => {
  updateConnList()
})

node.addEventListener('self:peer:update', (event) => {
  // Update multiaddrs list, only show WebRTC addresses
  const multiaddrs = node.getMultiaddrs()
    .filter(ma => isWebrtc(ma))
    .map((ma) => {
      const el = document.createElement('li')
      el.textContent = ma.toString()
      return el
    })
  document.getElementById('multiaddrs').replaceChildren(...multiaddrs)
})

node.handle(CHAT_PROTOCOL, async ({ stream }) => {
  chatStream = byteStream(stream)

  while (true) {
    const buf = await chatStream.read()
    appendOutput(`Received message '${toString(buf.subarray())}'`)
  }
})

const isWebrtc = (ma) => {
  return ma.protoCodes().includes(WEBRTC_CODE)
}

window.connect.onclick = async () => {
  ma = multiaddr(window.peer.value)
  appendOutput(`Dialing '${ma}'`)

  const signal = AbortSignal.timeout(5000)

  try {
    if (isWebrtc(ma)) {
      const rtt = await node.services.ping.ping(ma, {
        signal
      })
      appendOutput(`Connected to '${ma}'`)
      appendOutput(`RTT to ${ma.getPeerId()} was ${rtt}ms`)
    } else {
      await node.dial(ma, {
        signal
      })
      appendOutput('Connected to relay')
    }
  } catch (err) {
    if (signal.aborted) {
      appendOutput(`Timed out connecting to '${ma}'`)
    } else {
      appendOutput(`Connecting to '${ma}' failed - ${err.message}`)
    }
  }
}

window.send.onclick = async () => {
  if (chatStream == null) {
    appendOutput('Opening chat stream')

    const signal = AbortSignal.timeout(5000)

    try {
      const stream = await node.dialProtocol(ma, CHAT_PROTOCOL, {
        signal
      })
      chatStream = byteStream(stream)

      Promise.resolve().then(async () => {
        while (true) {
          const buf = await chatStream.read()
          appendOutput(`Received message '${toString(buf.subarray())}'`)
        }
      })
    } catch (err) {
      if (signal.aborted) {
        appendOutput('Timed out opening chat stream')
      } else {
        appendOutput(`Opening chat stream failed - ${err.message}`)
      }

      return
    }
  }

  const message = window.message.value.toString().trim()
  appendOutput(`Sending message '${message}'`)
  chatStream.write(fromString(message))
    .catch(err => {
      appendOutput(`Error sending message - ${err.message}`)
    })
}
