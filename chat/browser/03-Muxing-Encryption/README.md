# Chapter 03 - Muxing and Encryption

1. Import `pull-mplex` and `libp2p-secio`
1. Add `pull-mplex` to the streamMuxer configuration list
1. Listen on the libp2p instance for the `peer:connect` event, and log out the returned `PeerInfo.id.toB58String()` id string.
1. Add `libp2p-secio` to the connEncryption list
