import PeerInfo from 'peer-info'

function createPeerInfo (peerId) {
  return new Promise((resolve, reject) => {
    let callback = (err, peerInfo) => {
      if (err) return reject(err)
      resolve(peerInfo)
    }

    if (!peerId) {
      peerId = callback
      callback = null
    }

    PeerInfo.create(peerId, callback)
  })
}

export async function getOrCreatePeerInfo () {
  let peerInfo
  try {
    const peerId = JSON.parse(localStorage.getItem('peerId'))
    peerInfo = await createPeerInfo(peerId)
  } catch (err) {
    console.info('Could not get the stored peer id, a new one will be generated', err)
    peerInfo = await createPeerInfo()
    console.info('Storing our peer id in local storage so it can be reused')
    localStorage.setItem('peerId', JSON.stringify(peerInfo.id))
  }

  return peerInfo
}
