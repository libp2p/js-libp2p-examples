/* eslint-disable no-console */
// eslint-disable-next-line
'use strict'

import { peerIdFromString } from '@libp2p/peer-id'
import { CID } from 'multiformats/cid'
import React from 'react'
import { configureLibp2p } from './libp2p.js'

const Component = React.Component

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      // This hash is the 'hello world' string
      hash: 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e',
      // This peer is one of the Bootstrap nodes for Helia
      peer: 'QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
      isLoading: 0
    }
    this.peerInterval = null

    this.handleHashChange = this.handleHashChange.bind(this)
    this.handleHashSubmit = this.handleHashSubmit.bind(this)
    this.handlePeerChange = this.handlePeerChange.bind(this)
    this.handlePeerSubmit = this.handlePeerSubmit.bind(this)
  }

  handleHashChange (event) {
    this.setState({
      hash: event.target.value
    })
  }

  handlePeerChange (event) {
    this.setState({
      peer: event.target.value
    })
  }

  async handleHashSubmit (event) {
    event.preventDefault()
    this.setState({
      isLoading: this.state.isLoading + 1
    })

    const providers = []

    for await (const provider of this.libp2p.contentRouting.findProviders(CID.parse(this.state.hash))) {
      providers.push(provider)

      this.setState({
        response: JSON.stringify(providers, null, 2),
        isLoading: this.state.isLoading - 1
      })
    }
  }

  async handlePeerSubmit (event) {
    event.preventDefault()
    this.setState({
      isLoading: this.state.isLoading + 1
    })

    try {
      const peerInfo = await this.libp2p.peerRouting.findPeer(peerIdFromString(this.state.peer))

      this.setState({
        response: JSON.stringify(peerInfo, null, 2),
        isLoading: this.state.isLoading - 1
      })
    } catch (err) {
      this.setState({
        response: `Error finding peer: ${err.message}`,
        isLoading: this.state.isLoading - 1
      })
    }
  }

  async componentDidMount () {
    window.libp2p = this.libp2p = await configureLibp2p()
  }

  render () {
    return (
      <div>
        <header className="center">
          <h1>Delegated Routing</h1>
        </header>
        <section className="center">
          <form onSubmit={this.handleHashSubmit}>
            <label>
              Find providers of CID:
              <input type="text" value={this.state.hash} onChange={this.handleHashChange} id="find-providers-input" />
              <input type="submit" value="Find Providers" id="find-providers-button" />
            </label>
          </form>
          <form onSubmit={this.handlePeerSubmit}>
            <label>
              Find peer:
              <input type="text" value={this.state.peer} onChange={this.handlePeerChange} id="find-peer-input" />
              <input type="submit" value="Find PeerInfo" id="find-peer-button" />
            </label>
          </form>
        </section>
        <section className={[this.state.isLoading > 0 ? 'loading' : '', 'loader'].join(' ')}>
          <div className="lds-ripple"><div></div><div></div></div>
        </section>
        <section>
          <pre id="output">
            {this.state.response}
          </pre>
        </section>
      </div>
    )
  }
}

export default App
