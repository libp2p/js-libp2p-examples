# @libp2p/example-auto-tls

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> How to get a TLS certificate automatically

[Interplanetary Shipyard](https://ipshipyard.com/) operates a public-good DNS
service that will answer [Acme DNS-01 Challenges](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge)
on behalf of any Internet user.

This means that we can use a service such as [Let's Encrypt](https://letsencrypt.org/)
to generate certificates we can use to upgrade our WebSocket transport listeners
to a Secure WebSocket version automatically.

## AutoTLS flow

The steps for obtaining a TLS certificate are:

1. Have a publicly routable listening address
2. Claim the `*.<peerID>.libp2p.direct` domain name by `POST`ing a message to [register.libp2p.direct](https://github.com/ipshipyard/p2p-forge?tab=readme-ov-file#submitting-challenge-records)
3. Contact an ACME provider to perform the [DNS-01](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge) challenge and generate a certificate
4. Add HTTPS listeners to any relevant transports


## Setup

1. Clone this repo then install the dependencies of this example with `npm install`

## Instructions

The requirements for using `libp2p.direct` are:

1. A publicly routable socket address
2. A WebSocket or TCP listener
3. The [identify](https://www.npmjs.com/package/@libp2p/identify) protocol

ACME services normally have quite restrictive rate limits, so we'll configure a
a persistent datastore and a keychain so we can reuse any generated
certificates, their private keys and the PeerID it's tied to.

Let's configure the relevant modules:

```js
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webSockets } from '@libp2p/websockets'
import { createLibp2p } from 'libp2p'
import { autoTLS } from '@libp2p/auto-tls'
import { identify, identifyPush } from '@libp2p/identify'
import { keychain } from '@libp2p/keychain'
import { LevelDatastore } from 'datastore-level'
import { loadOrCreateSelfKey } from '@libp2p/config'

const datastore = new LevelDatastore('./db')
await datastore.open()

const privateKey = await loadOrCreateSelfKey(datastore)

const libp2p = await createLibp2p({
  datastore,
  privateKey,
  addresses: {
    listen: [
      '/ip4/0.0.0.0/tcp/0/ws',
      '/ip6/::/tcp/0/ws'
    ]
  },
  transports: [
    webSockets()
  ],
  connectionEncrypters: [
    noise()
  ],
  streamMuxers: [
    yamux()
  ],
  services: {
    autoTLS: autoTLS(),
    identify: identify(),
    identifyPush: identifyPush(),
    keychain: keychain()
  }
})
```

> [!TIP]
> If you want to experiment without hitting ACME service rate limits, you can
> set the `acmeDirectory` to a staging address, though be aware that any
> certificates generated will be self-signed:
>
> ```TypeScript
> const libp2p = await createLibp2p({
>   // other config
>   services: {
>     autoTLS: autoTLS({
>       acmeDirectory: 'https://acme-staging-v02.api.letsencrypt.org/directory'
>     }),
>     // other config
>   }
> })
> ```

## Getting a publicly routable address

If we start the node now, we'll notice that nothing happens. The reason is that
we don't have a publicly routable address.

### Manual configuration

If you know you have a publicly routable address, for example if you are
deploying your app on a server or you have manually configured port forwarding
on your router then you can add your transport addresses to the `appendAnnounce`
config key:

> [!IMPORTANT]
> Multiaddrs added to `announce` or `appendAnnounce` will automatically be
> verified as publicly dialable where possible, though note that the domain name
> allocated by `libp2p.direct` will still need to be verified via AutoNAT or
> auto-confirmation - see the next section on confirming dialable addresses for
> more

```js
const libp2p = await createLibp2p({
  addresses: {
    appendAnnounce: [
      '/ip4/123.123.123.123/tcp/1234/ws'
    ],
    // other config
  },
  // other config
})
```

### Automatic configuration via UPnP

If you a home user and your router supports configuring port forwarding via
[UPnP](https://en.wikipedia.org/wiki/Universal_Plug_and_Play), you can use the
[@libp2p/upnp-nat](https://www.npmjs.com/package/@libp2p/upnp-nat) module to
automatically configure port forwarding for IPv4 and IPv6 networks:

> [!IMPORTANT]
> This will only work if your router supports configuring port forwarding via
> UPnP and also has it enabled.
>
> ISP provided routers sometimes do not and most ship with UPnP disabled by
> default - please check your router documentation for more information

```TypeScript
import { uPnPNAT } from '@libp2p/upnp-nat'

const libp2p = await createLibp2p({
  services: {
    upnp: uPnPNAT()
    // other config
  }
})
```

### Confirming dialable addresses

Designing distributed systems typically involves trying to trust other system
components as little as possible.  Systems with a lot of trust tend to not be
[Byztantine fault](https://en.wikipedia.org/wiki/Byzantine_fault)-tolerant.

So far we've introduced two components that we are implicitly trusting. One is
`libp2p.direct` - we trust that it will configure the DNS records to answer the
ACME DNS-01 challenge correctly, and we trust that the external address reported
by our UPnP router is correct.

By default libp2p will not broadcast any public address until it has been
confirmed to be dialable.

We can skip this and explicitly trust `libp2p.direct` and our router by
auto-confirming the DNS mapping and the public IP address:

```TypeScript
import { uPnPNAT } from '@libp2p/upnp-nat'

const libp2p = await createLibp2p({
  services: {
    autoTLS: autoTLS({
      // automatically mark *.<peerID>.libp2p.direct as routable
      autoConfirmAddress: true
    }),
    upnp: uPnPNAT({
      // automatically mark any detected socket address as routable
      autoConfirmAddress: true
    })
    // other config
  }
})
```

To not trust these actors and instead require confirmation from multiple peers
in different network segments that the addresses are, in fact dialable, we need
to configure [@libp2p/autonat](https://www.npmjs.com/package/@libp2p/autonat).

#### AutoNAT

This requires a few more system components.  The rough flow here is:

1. Acquire network peers that speak the `/libp2p/autonat/1.0.0` protocol
2. Ask peers from a range of networks to dial us back on a specific address
3. Mark the address as reachable/not reachable after enough responses are received

To find network peers we need a peer routing system such as [@libp2p/kad-dht](https://www.npmjs.com/package/@libp2p/kad-dht) (One day we may be able to use a [lightweight HTTP alternative](https://github.com/ipfs/specs/pull/476)
but that day is not today).

So far we've only configured a WebSocket listener, but if we use the Amino
flavour of KAD-DHT (e.g. the public IPFS network), we have to be aware of
[the spread of supported transports](https://probelab.io/ipfs/amino/#dht-transport-distribution).

Because the WebSockets transport is not common, we need to add the [@libp2p/tcp](https://www.npmjs.com/package/@libp2p/tcp) transport to increase our likelihood of being able to
communicate with network peers.

Finally we need to also use the [@libp2p/bootstrap](https://www.npmjs.com/package/@libp2p/bootstrap)
module to connect to an initial set of peers that will let us start to fill our
routing table and perform queries:

```js
import { autoNAT } from '@libp2p/autonat'
import { bootstrap } from '@libp2p/bootstrap'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { tcp } from '@libp2p/tcp'

const libp2p = await createLibp2p({
  // other config
  transports: [
    // other config
    tcp()
  ],
  services: {
    autoNAT: autoNAT(),
    aminoDHT: kadDHT({
      protocol: '/ipfs/kad/1.0.0',
      peerInfoMapper: removePrivateAddressesMapper
    }),
    bootstrap: bootstrap({
      list: [
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
        '/dnsaddr/va1.bootstrap.libp2p.io/p2p/12D3KooWKnDdG3iXw9eTFijk3EWSunZcFi54Zka4wmtqtt6rPxc8',
        '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
      ]
    })
    // other config
  }
})
```

If you are running on your own network which has better support for varied
transports you may not need to add `@libp2p/tcp`.

## Putting it all together

Phew, well done making it this far.

If you are happy trusting the IP address assigned by your ISP and router, and
that `libp2p.direct` has configured DNS for you correctly, you can run the
working example in [./auto-confirm.js](./auto-confirm.js).

If you want to go the full trust-free route, please see the example in
[./trust-free.js](./trust-free.js).

After a little while you should see multiaddr(s) that include the
[Server name indication](https://en.wikipedia.org/wiki/Server_Name_Indication)
tuple:

```console
$ node ./trust-free.js
/ip4/[ip-address]/tcp/[port]/tls/sni/ip-address.base32-peer-id.libp2p.direct/ws/p2p/12D3Foo
```

## Need help?

- Read the [js-libp2p documentation](https://github.com/libp2p/js-libp2p/tree/main/doc)
- Check out the [js-libp2p API docs](https://libp2p.github.io/js-libp2p/)
- Check out the [general libp2p documentation](https://docs.libp2p.io) for tips, how-tos and more
- Read the [libp2p specs](https://github.com/libp2p/specs)
- Ask a question on the [js-libp2p discussion board](https://github.com/libp2p/js-libp2p/discussions)

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
