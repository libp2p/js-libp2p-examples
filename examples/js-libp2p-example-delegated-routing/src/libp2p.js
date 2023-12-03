import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'
import { webSockets } from '@libp2p/websockets'
import { createLibp2p } from 'libp2p'

/**
 * Creates a basic libp2p node - no listen addresses (so dial-only), no muxers
 * or encrypters, and no content/peer routing modules apart from the delegated
 * routing v1 http api client
 */
export async function configureLibp2p () {
  return await createLibp2p({
    transports: [
      webSockets()
    ],
    services: {
      delegatedRouting: () => createDelegatedRoutingV1HttpApiClient('http://127.0.0.1:9832')
    }
  })
}
