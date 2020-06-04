const SignalingServer = require('libp2p-webrtc-star/src/sig-server')

module.exports = () => {
  return SignalingServer.start({
    port: 15555
  })
}
