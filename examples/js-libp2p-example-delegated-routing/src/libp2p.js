import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'
import { createLibp2p } from 'libp2p'

/**
 * Creates a basic libp2p node - it will only perform peer/content routing via
 * the configured delegated routing v1 http api client
 */
export async function configureLibp2p () {
  return await createLibp2p({
    services: {
      delegatedRouting: () => createDelegatedRoutingV1HttpApiClient('http://127.0.0.1:9832')
    }
  })
}
