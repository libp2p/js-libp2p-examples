'use strict'

const os = require('os')
const Multiaddr = require('multiaddr')

function getWSMultiaddr (port) {
  const ip = getPublicIp()

  return Multiaddr(`/ip4/${ip}/tcp/${port}/ws`)
}

function getPublicIp () {
  const netInterfaces = Object.values(os.networkInterfaces())
  for (const ni of netInterfaces) {
    for (const address of ni) {
      if (address.family === 'IPv4' && address.internal === false) {
        // Return the IP
        return address.address
      }
    }
  }
}

console.log(getWSMultiaddr().toString())