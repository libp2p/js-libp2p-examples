# Chapter 05 - Peer Discovery

- Configure libp2p with Bootstrap, WebRTCStar transport rendezvous and DHT Random Walk for discovery
  1. Import `libp2p-bootstrap` and `libp2p-kad-dht`
  2. Set the `dht` config value to the `libp2p-kad-dht` variable you created earlier.
  3. Add `libp2p-bootstrap` to the `peerDiscovery` array.
- Remove the connect code, and add our target peer as a bootstrap node
