const SignalingServer = require('libp2p-webrtc-star/src/sig-server')

module.exports = (callback) => {
  SignalingServer.start({
    port: 15555
  })
  .then(server => {
    callback(null, server)
  })
  .catch(callback)
}
