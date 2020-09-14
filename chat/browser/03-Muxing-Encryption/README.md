# Chapter 03 - Muxing and Encryption

1. Import `libp2p-mplex` and `libp2p-noise`
1. Add `libp2p-mplex` to the streamMuxer configuration list
1. Listen on the libp2p.connectionManager instance for the `peer:connect` event, and log out the returned `connection.remotePeer.toB58String()` id string.
1. Add `libp2p-noise` to the connEncryption list
