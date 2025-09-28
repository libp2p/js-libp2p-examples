import { webRTCDirect } from '@libp2p/webrtc'
import { multiaddr } from '@multiformats/multiaddr'
import { createLibp2p } from 'libp2p'
import { fromString, toString } from 'uint8arrays'

let stream
const output = document.getElementById('output')
const sendSection = document.getElementById('send-section')
const appendOutput = (line) => {
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(line))
  output.append(div)
}
const clean = (line) => line.replaceAll('\n', '')

const node = await createLibp2p({
  transports: [webRTCDirect()],
  connectionGater: {
    denyDialMultiaddr: () => {
      // by default we refuse to dial local addresses from the browser since they
      // are usually sent by remote peers broadcasting undialable multiaddrs but
      // here we are explicitly connecting to a local node so do not deny dialing
      // any discovered address
      return false
    }
  }
})

await node.start()

node.addEventListener('peer:connect', (connection) => {
  appendOutput(`Peer connected '${node.getConnections().map(c => c.remoteAddr.toString())}'`)
  sendSection.style.display = 'block'
})

window.connect.onclick = async () => {
  const ma = multiaddr(window.peer.value)

  appendOutput(`Dialing '${ma}'`)
  stream = await node.dialProtocol(ma, '/echo/1.0.0')

  stream.addEventListener('message', (evt) => {
    const response = toString(evt.data.subarray())
    appendOutput(`Received message '${clean(response)}'`)
  })
}

window.send.onclick = async () => {
  const message = `${window.message.value}\n`
  appendOutput(`Sending message '${clean(message)}'`)
  stream.send(fromString(message))
}
