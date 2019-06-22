# Nodejs based chat

The chapters in this example are organized sequentially by folder name. The names also include the overall topic. For example, `01-Transports` is the first chapter and includes an overview of Transports.

## Setup

1. Install node modules via `npm clean-install`

### Running the Bootstrap node
This works with the Bootstrap node located at [./bootstrap](./bootstrap). See the instructions there for its setup.

## Running the Chapters

**Important Note**: All modules you need will be installed in the [setup][setup] phase. If a chapter asks for you to add a module to libp2p, you will only need to declare it in the code.

For the particular chapter you are doing, you will need to `cd` into the directory and execute `node index.js` from there. This ensures that the libp2p code for that particular chapter is executed.

For example, starting the Transports lesson you will cd into the [./01-Transports](./01-Transports) directory and run `node index.js`.

```sh
cd ./01-Transports
node index.js
```

[setup]: #setup
