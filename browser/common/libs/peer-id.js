import PeerId from 'peer-id'

export async function getOrCreatePeerId () {
  let peerId
  try {
    // eslint-disable-next-line
    peerId = JSON.parse(localStorage.getItem('peerId'))
    peerId = await PeerId.createFromJSON(peerId)
  } catch (err) {
    console.info('Could not get the stored peer id, a new one will be generated', err)
    peerId = await PeerId.create()
    console.info('Storing our peer id in local storage so it can be reused')
    // eslint-disable-next-line
    localStorage.setItem('peerId', JSON.stringify(peerId.toJSON()))
  }

  return peerId
}
