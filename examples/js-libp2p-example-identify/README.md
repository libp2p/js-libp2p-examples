# js-libp2p-example-identify

This example demonstrates how to use the identify protocol in js-libp2p to exchange peer information.

## Requirements

- Node.js version 20 or higher
- npm version 7 or higher

## Setup

1. Install dependencies:
   ```console
   $ npm install
   ```

2. Run the example in two terminals:

   Terminal 1 (Listener):
   ```console
   $ npm start
   ```

   Terminal 2 (Dialer):
   ```console
   $ npm run dial -- <multiaddr>
   ```
   Replace `<multiaddr>` with the multiaddr shown in the listener's output.

## How It Works

- The example creates two libp2p nodes: a listener and a dialer
- The listener starts and displays its peer ID and multiaddrs
- The dialer connects to the listener using the provided multiaddr
- When the connection is established, the identify protocol is triggered automatically
- Both peers exchange and display detailed information about each other

## Example Output

When running the example, you'll see output similar to this:

Listener output:
```
Listener node started with peer ID: 12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
Listener multiaddrs: /ip4/127.0.0.1/tcp/37097/p2p/12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
/ip4/192.168.1.17/tcp/37097/p2p/12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
/ip4/10.155.221.162/tcp/37097/p2p/12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
/ip4/127.0.0.1/tcp/37941/ws/p2p/12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
/ip4/192.168.1.17/tcp/37941/ws/p2p/12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
/ip4/10.155.221.162/tcp/37941/ws/p2p/12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
New connection opened: 12D3KooWKYAhezQQqwWvQ8iECUv9R5tTy6639s13ZqrS5tp66Hpd

=== Identify Information ===
Peer ID: 12D3KooWKYAhezQQqwWvQ8iECUv9R5tTy6639s13ZqrS5tp66Hpd
Agent Version: js-libp2p/2.8.5 node/21.7.3
Protocol Version: ipfs/0.1.0
Supported protocols: [ '/ipfs/id/1.0.0' ]
Observed address: Multiaddr(/ip4/127.0.0.1/tcp/37097/p2p/12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp)
Listen addresses: [
  '/ip4/127.0.0.1/tcp/41267',
  '/ip4/192.168.1.17/tcp/41267',
  '/ip4/10.155.221.162/tcp/41267',
  '/ip4/127.0.0.1/tcp/45747/ws',
  '/ip4/192.168.1.17/tcp/45747/ws',
  '/ip4/10.155.221.162/tcp/45747/ws'
]
===========================
```

Dialer output:
```
Dialer node started with peer ID: 12D3KooWKYAhezQQqwWvQ8iECUv9R5tTy6639s13ZqrS5tp66Hpd
Dialing to: /ip4/127.0.0.1/tcp/37097/p2p/12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
New connection opened: 12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
Successfully dialed to target node

=== Identify Information ===
Peer ID: 12D3KooWF496AdcXPuXgiUeGpRVR29QZeRyyiyYK3dsmgyhqbacp
Agent Version: js-libp2p/2.8.5 node/21.7.3
Protocol Version: ipfs/0.1.0
Supported protocols: [ '/ipfs/id/1.0.0' ]
Observed address: Multiaddr(/ip4/127.0.0.1/tcp/49744/p2p/12D3KooWKYAhezQQqwWvQ8iECUv9R5tTy6639s13ZqrS5tp66Hpd)
Listen addresses: [
  '/ip4/127.0.0.1/tcp/37097',
  '/ip4/192.168.1.17/tcp/37097',
  '/ip4/10.155.221.162/tcp/37097',
  '/ip4/127.0.0.1/tcp/37941/ws',
  '/ip4/192.168.1.17/tcp/37941/ws',
  '/ip4/10.155.221.162/tcp/37941/ws'
]
===========================
```

The identify information includes:
- Peer ID: The unique identifier of the peer
- Agent Version: The version of the libp2p implementation and runtime
- Protocol Version: The version of the identify protocol
- Supported protocols: List of protocols that the peer supports
- Observed address: The address that the peer sees you connecting from
- Listen addresses: All addresses that the peer is listening on

## Need Help?

- Read the [js-libp2p documentation](https://github.com/libp2p/js-libp2p/tree/main/doc)
- Check out the [js-libp2p API docs](https://libp2p.github.io/js-libp2p/)
- Ask a question on the [js-libp2p discussion board](https://github.com/libp2p/js-libp2p/discussions) 