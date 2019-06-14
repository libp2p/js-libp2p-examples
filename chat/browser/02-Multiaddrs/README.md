# Chapter 02 - Multiaddrs

**Note**: For this chapter, you can get the multiaddr of the peer to dial by running the Bootstrap node as mentioned in the [browser README](../README.md). Running the node will result in the browser addresses being printed.

- Add the webrtc signaling server address to our `PeerInfo` multiaddrs list
- Connect to a specific peer, given its address.
- Log an error if one occurs on dial
- Log a success message if there is no error
