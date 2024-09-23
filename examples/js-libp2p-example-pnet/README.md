# @libp2p/example-pnet

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-examples.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-examples)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-examples/ci.yml?branch=main\&style=flat-square)](https://github.com/libp2p/js-libp2p-examples/actions/workflows/ci.yml?query=branch%3Amain)

> How to configure a libp2p private network

libp2p networks allow any peer to connect to any other peer and to communicate
with them via protocol streams.

What if you only want to allow a certain subset of peers to connect to you? It's
possible to use a pre-shared key to create a private network on top of the
public libp2p network using the `@libp2p/pnet` module.

## Setup

1. Install the modules in the libp2p root directory, `npm install` and`npm run build`.

## Run

Running the example will cause two nodes with the same swarm key to be started
and exchange basic information.

```
node index.js
```

### Using different keys

This example includes `TASK` comments that can be used to try the example with
different swarm keys. This will allow you to see how nodes will fail to connect
if they are on different private networks and try to connect to one another.

To change the swarm key of one of the nodes, look through `index.js` for
comments starting with `TASK` to indicate where lines are that pertain to
changing the swarm key of node 2.

### Exploring the repos

Once you've run the example you can take a look at the repos in the `./tmp`
directory to see how they differ, including the swarm keys. You should see a
`swarm.key` file in each of the repos and when the nodes are on the same private
network this contents of the `swarm.key` files should be the same.

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
