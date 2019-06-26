# Chapter 05 - Peer Discovery

- Configure libp2p with Bootstrap, WebRTCStar transport rendezvous and DHT Random Walk for discovery
  1. Import `libp2p-bootstrap` and `libp2p-kad-dht`
  1. Create an instance of WebRTCStar, and use the new instance in the `transport` configuration instead.
  1. Set the `dht` config value to the `libp2p-kad-dht` variable you created earlier.
  1. Add `libp2p-bootstrap` and the `.discovery` property of the WebRTCStar instance to the `peerDiscovery` array.
- Remove the connect code, and add our target peer as a bootstrap node
