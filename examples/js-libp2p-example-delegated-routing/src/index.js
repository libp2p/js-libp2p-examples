/* eslint-disable no-console */

import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'
import { createLibp2p } from 'libp2p'
import { peerIdFromString } from '@libp2p/peer-id'
import { CID } from 'multiformats/cid'

const DOM = {
  findProvidersInput: () => document.getElementById('find-providers-input'),
  findProvidersButton: () => document.getElementById('find-providers-button'),

  findPeerInput: () => document.getElementById('find-peer-input'),
  findPeerButton: () => document.getElementById('find-peer-button'),

  loadingNotificationElement: () => document.getElementById('loading-notification'),

  output: () => document.getElementById('output')
}

const libp2p = await createLibp2p({
  services: {
    delegatedRouting: () => createDelegatedRoutingV1HttpApiClient('http://127.0.0.1:9832')
  }
})

// find providers
DOM.findProvidersButton().onclick = async (event) => {
  event.preventDefault()
  DOM.loadingNotificationElement().className = 'loading'

  try {
    const cid = CID.parse(DOM.findProvidersInput().value)
    const providers = []
    DOM.output().innerText = ''

    for await (const provider of libp2p.contentRouting.findProviders(cid)) {
      providers.push(provider)

      DOM.output().innerText = JSON.stringify(providers, null, 2)
    }
  } finally {
    DOM.loadingNotificationElement().className = ''
  }
}

// find peer
DOM.findPeerButton().onclick = async (event) => {
  event.preventDefault()
  DOM.loadingNotificationElement().className = 'loading'

  try {
    const peerId = peerIdFromString(DOM.findPeerInput().value)
    DOM.output().innerText = ''
    const peerInfo = await libp2p.peerRouting.findPeer(peerId)

    DOM.output().innerText = JSON.stringify(peerInfo, null, 2)
  } finally {
    DOM.loadingNotificationElement().className = ''
  }
}
