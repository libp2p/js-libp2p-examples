import PeerInfo from 'peer-info'

export async function getOrCreatePeerInfo () {
  let peerInfo
  try {
    const peerId = JSON.parse(localStorage.getItem('peerId'))
    peerInfo = await PeerInfo.create(peerId)
  } catch (err) {
    console.info('Could not get the stored peer id, a new one will be generated', err)
    peerInfo = await PeerInfo.create()
    console.info('Storing our peer id in local storage so it can be reused')
    localStorage.setItem('peerId', JSON.stringify(peerInfo.id))
  }

  return peerInfo
}
