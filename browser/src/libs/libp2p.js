import PeerInfo from 'peer-info'
import createLibp2p from './libp2p-bundle'
import pull from 'pull-stream'
import Chat from '../../common/chat'

const getOrCreatePeerInfo = () => {
  let peerId = null
  try {
    peerId = JSON.parse(localStorage.getItem('peerId'))
  } catch (err) {
    console.log('Could not get the stored peer id, a new one will be generated')
  }

  PeerInfo.create(peerId || peerInfoCreatedHandler, peerInfoCreatedHandler)
}

export async function libp2p () {

}

(() => {
  let peerId = null
  try {
    peerId = JSON.parse(localStorage.getItem('peerId'))
  } catch (err) {
    console.log('Could not get the stored peer id, a new one will be generated')
  }

  PeerInfo.create(peerId || peerInfoCreatedHandler, peerInfoCreatedHandler)

  function peerInfoCreatedHandler (err, peerInfo) {
    if (err) return console.error(err)

    localStorage.setItem('peerId', JSON.stringify(peerInfo.id))

    const onMessage = ({ from, message }) => {
      console.log(`${from}(${new Date(message.created).toUTCString()}): ${message.data}`)
    }

    const libp2p = createLibp2p(peerInfo)
    const chat = new Chat(libp2p, '/libp2p/chat/ipfs-camp/2019', onMessage)

    // Setup chat
    // libp2p.handle('/libp2p/chat/1.0.0', (_, stream) => {
    //   pull(
    //     stream,
    //     pull.collect((err, message) => {
    //       if (err) return console.error(err)
    //       console.log(message)
    //     })
    //   )
    // })

    const chatBox = document.getElementById('chat-text')
    document.getElementById('chat-send').addEventListener('click', (event) => {
      console.log('Chat clicked', chatBox.value)
      const message = Buffer.from(chatBox.value)
      chatBox.value = ''
      // const peer1 = libp2p.peerBook.getAllArray()[0]
      // libp2p.dialProtocol(peer1, '/libp2p/chat/1.0.0', (err, stream) => {
      //   if (err) return console.error(err)
      //   pull(
      //     pull.values([message]),
      //     stream
      //   )
      // })
      chat.send(message, (err) => {
        console.log('Publish done', err)
      })
    })

    libp2p.on('peer:discovery', (peerInfo) => {
      console.log('Discovered peer', peerInfo.id.toB58String())
    })
    libp2p.on('peer:connect', (peerInfo) => {
      console.log('Connected to peer', peerInfo.id.toB58String())
    })
    libp2p.on('peer:disconnect', (peerInfo) => {
      console.log('Disconnected from peer', peerInfo.id.toB58String())
    })
    libp2p.start((err) => {
      if (err) return console.error(err)

      // libp2p.pubsub.subscribe('/libp2p/chat/ipfs-camp/2019', null, (message) => {
      //   console.log(`${message.from}: ${String(message.data)}`)
      // }, (err) => {
      //   console.log('Subscribed to /libp2p/chat/ipfs-camp/2019')
      // })
    })
  }
})()