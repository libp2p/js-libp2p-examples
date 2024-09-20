/* eslint-disable no-console */

import { createLibp2p } from './libp2p.js'
import { stdinToStream, streamToConsole } from './stream.js'

async function run () {
  // Create a new libp2p node on localhost with a randomly chosen port
  const dialer = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    }
  })

  // Output this node's address
  console.log('Dialer ready, listening on:')
  dialer.getMultiaddrs().forEach((ma) => {
    console.log(ma.toString())
  })

  dialer.addEventListener('peer:discovery', (evt) => {
    console.info('peer:discovery', evt.detail)

    // Dial to the remote peer (the "listener")
    dialer.dialProtocol(evt.detail.multiaddrs, '/chat/1.0.0')
      .then(stream => {
        console.log('Dialer dialed to listener on protocol: /chat/1.0.0')
        console.log('Type a message and see what happens')

        // Send stdin to the stream
        stdinToStream(stream)
        // Read the stream and output to console
        streamToConsole(stream)
      })
  })
}

run()
