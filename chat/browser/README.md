# Browser based chat

The chapters in this example are organized sequentially by folder name. The names also include the overall topic. For example, `01-Transports` is the first chapter and includes an overview of Transports.

The `common` folder contains the UI code leveraged across each of the chapters. Some chapters may require you to update code in `common` as you progress, in order to bind the latest features you've added to libp2p to the UI. If you get stuck and aren't sure what to update, you can use the [help README][help] to see the needed changes.

## Setup

1. Install node modules via `npm clean-install`

### Running the Bootstrap node
This works with the Bootstrap node located at [../nodejs/bootstrap](../nodejs/bootstrap). See the instructions there for its setup.

## Running the Chapters

**Important Note**: All modules you need will be installed in the [setup][setup] phase. If a chapter asks for you to add a module to libp2p, you will **only** need to declare it in the code.

For the particular chapter you are doing, you will need to `cd` into the directory and execute `npm start` from there. This ensures that the libp2p code for that particular chapter is served up by the [parcel][parcel] bundler.

For example, starting the Transports lesson you will cd into the [./01-Transports](./01-Transports) directory and run `npm start`.

```sh
cd ./01-Transports
npm start
```

[parcel]: https://parceljs.org
[setup]: #setup
[help]: ./help/README.md
