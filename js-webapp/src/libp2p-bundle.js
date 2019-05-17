import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import Secio from 'libp2p-secio'
import Mplex from 'pull-mplex'
import Bootstrap from 'libp2p-bootstrap'

const createBootstrapNode = (peerInfo) => {
  return new Libp2p({
    peerInfo,
    modules: {
      transport: [ Websockets ],
      streamMuxer: [ Mplex ],
      connEncryption: [ Secio ],
      peerDiscovery: [ Bootstrap ]
    },
    config: {
      peerDiscovery: {
        bootstrap: {
          enabled: true,
          list: ['/ip4/192.168.178.33/tcp/63785/ws/ipfs/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d']
        }
      },
      EXPERIMENTAL: {
        pubsub: true
      }
    }
  })
}

export default createBootstrapNode
