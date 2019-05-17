const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  watch: true,
  watchOptions: {
    ignored: /node_modules/
  },
  devtool: 'source-map'
}
