<p align="center">
  <a href="https://libp2p.io">
    <img width="250" src="https://github.com/libp2p/js-libp2p/blob/master/img/libp2p.png?raw=true" alt="libp2p hex logo" />
  </a>
</p>

<h3 align="center">A collection of js-libp2p examples</h3>

<p align="center">
  <img src="https://raw.githubusercontent.com/jlord/forkngo/gh-pages/badges/cobalt.png" width="200">
  <br>
  <a href="https://github.com/libp2p/js-libp2p/tree/master/doc">Explore the docs</a>
  ·
  <a href="https://github.com/libp2p/js-libp2p-examples/issues">Report Bug</a>
  ·
  <a href="https://github.com/libp2p/js-libp2p-examples/issues">Request Feature/Example</a>
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Examples](#examples)
    - [Understanding how libp2p works](#understanding-how-libp2p-works)
    - [Other examples](#other-examples)
    - [libp2p in the Browser](#libp2p-in-the-browser)
  - [Prerequisites](#prerequisites)
- [Documentation](#documentation)
- [Want to hack on IPFS?](#want-to-hack-on-ipfs)

## About The Project

- Read the [docs](https://ipfs.github.io/helia/modules/helia.html)
- Look into other [examples](https://github.com/libp2p/js-libp2p-examples) to learn how to spawn a Helia node in Node.js and in the Browser
- Visit https://dweb-primer.ipfs.io to learn about IPFS and the concepts that underpin it
- Head over to https://proto.school to take interactive tutorials that cover core IPFS APIs
- Check out https://docs.ipfs.io for tips, how-tos and more
- See https://blog.ipfs.io for news and more
- Need help? Please ask 'How do I?' questions on https://discuss.ipfs.io

## Getting Started

### Examples

Feel free to jump directly into the examples, however going through the following sections will help build context and background knowledge.

#### Understanding how libp2p works

- [Circuit Relay](./examples/js-libp2p-example-circuit-relay)

#### Other examples

- Running libp2p in the Electron (future)
- [The standard echo net example with libp2p](./echo)
- [A simple chat app with libp2p](./chat)

#### libp2p in the Browser
There are a number of ways libp2p can be used in the browser. Here are some examples:

- [webRTC](./libp2p-in-the-browser/webrtc/README.md)
- [websockets](./libp2p-in-the-browser/websockets/README.md)
- [webtransport](./libp2p-in-the-browser/webtransport/README.md)

There is also an tutorial of how all of these transports can be [universally connected](https://github.com/libp2p/universal-connectivity/tree/main)

### Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

- Git - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## Documentation

- [IPFS Primer](https://dweb-primer.ipfs.io/)
- [IPFS Docs](https://docs.ipfs.io/)
- [Tutorials](https://proto.school)
- [More examples](https://github.com/libp2p/js-libp2p-examples)
- [API - Helia](https://ipfs.github.io/helia/modules/helia.html)
- [API - @helia/unixfs](https://ipfs.github.io/helia-unixfs/modules/helia.html)

## Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

The IPFS implementation in JavaScript needs your help! There are a few things you can do right now to help out:

Read the [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md) and [JavaScript Contributing Guidelines](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md).

- **Check out existing issues** The [issue list](https://github.com/ipfs/helia/issues) has many that are marked as ['help wanted'](https://github.com/ipfs/helia/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22) or ['difficulty:easy'](https://github.com/ipfs/helia/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Adifficulty%3Aeasy) which make great starting points for development, many of which can be tackled with no prior IPFS knowledge
- **Look at the [Helia Roadmap](https://github.com/ipfs/helia/blob/main/ROADMAP.md)** This are the high priority items being worked on right now
- **Perform code reviews** More eyes will help
  a. speed the project along
  b. ensure quality, and
  c. reduce possible future bugs
- **Add tests**. There can never be enough tests
