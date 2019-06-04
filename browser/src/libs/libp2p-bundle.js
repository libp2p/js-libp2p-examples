import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import Mplex from 'pull-mplex'
import Secio from 'libp2p-secio'
import Bootstrap from 'libp2p-bootstrap'
import KademliaDHT from 'libp2p-kad-dht'
import Floodsub from 'libp2p-floodsub'

const createLibp2p = (peerInfo) => {
  return new Libp2p({
    peerInfo,
    modules: {
      transport: [ Websockets ],
      streamMuxer: [ Mplex ],
      connEncryption: [ Secio ],
      peerDiscovery: [ Bootstrap ],
      dht: KademliaDHT
    },
    config: {
      peerDiscovery: {
        bootstrap: {
          enabled: true,
          list: [
            '/ip4/127.0.0.1/tcp/63786/ws/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d'
          ]
        }
      },
      EXPERIMENTAL: {
        pubsub: true
      }
    }
  })
}

export default createLibp2p
