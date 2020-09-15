# Chapter 02 - Multiaddrs

**Note**: For this chapter, you can get the multiaddr of the peer to dial by running the Bootstrap node as mentioned in the [browser README](../README.md). Running the node will result in the Bootstrap addresses being printed. Also expect to have an AggregateError in console as you will need to complete Chapter 03 before a full connection can be established. See [#25](/../../issues/25) for more details.

1. Import the `multiaddr` module
1. Add the webrtc signaling server address to our listen addresses
1. Connect to the Bootstrap node using its Websocket address
1. Log an error if one occurs on dial
1. Log a success message if there is no error
