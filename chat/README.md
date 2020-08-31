# Chat Example

This example will guide you through creating a basic Chat application with libp2p. The example provides you the opportunity to work through [Node.js][nodejs] or [Browser][browser] code.

Both examples will benefit from you using the provided [Bootstrap][bootstrap] node. You can view the README there.

## js-libp2p Version

This example has been updated for js-libp2p 0.29.0.

For previous versions of js-libp2p, please see their respective branch:
- [js-libp2p 0.28.x](https://github.com/libp2p/js-libp2p-examples/tree/libp2p-0.28.x)
- [js-libp2p 0.27.x](https://github.com/libp2p/js-libp2p-examples/tree/libp2p-0.27.x)
- [js-libp2p 0.25.x](https://github.com/libp2p/js-libp2p-examples/tree/libp2p-0.25.x)

## Resources

You can follow along with the [IPFS Camp 2019 Workshop slide deck](https://docs.google.com/presentation/d/1a_BjIM4ORQchnMNjOMO-wCDW2VS5nXeKXIbWSEqf9jY) if you'd like more information. Make sure to view the speaker notes if the slides aren't clear.

## Setup
**Important**: If you are running through this example by yourself you will need to run the Bootstrap node. If you are doing this with others on a local network (such as IPFS Camp), only 1 person should run the bootstrap server as its Peer ID is static.

1. Run the bootstrap node
  1. From [./nodejs][nodejs], run `npm clean-install` to install the node modules. **Note**: Installing the modules here, will also install everything you need for the Node.js example.
  1. From [./nodejs/bootstrap][bootstrap], run `node index.js` to run the Bootstrap server. **Note**: You can also chat from the Bootstrap node terminal, once you have reached that point in the Example.
1. If you are doing the Browser example, do the setup instructions in that [README](./browser/README.md)

[nodejs]: ./nodejs
[browser]: ./nodejs
[bootstrap]: ./nodejs/bootstrap
