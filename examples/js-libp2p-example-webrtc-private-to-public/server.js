/* eslint-disable no-console */

import { webRTCDirect } from '@libp2p/webrtc'
import { createLibp2p } from 'libp2p'

const node = await createLibp2p({
  addresses: {
    listen: [
      '/ip4/127.0.0.1/udp/0/webrtc-direct'
    ]
  },
  transports: [webRTCDirect()]
})

await node.start()

node.handle('/echo/1.0.0', (stream) => {
  stream.addEventListener('message', (evt) => {
    stream.send(evt.data)
  })
  stream.addEventListener('remoteCloseWrite', () => {
    stream.close()
      .catch(err => {
        stream.abort(err)
      })
  })
})

console.info('Server listening on')

node.getMultiaddrs().forEach(ma => {
  console.info(ma.toString())
})
