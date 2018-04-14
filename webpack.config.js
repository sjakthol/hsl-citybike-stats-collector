const path = require('path')

module.exports = {
  entry: './index.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },
  externals: ['aws-sdk'],
  module: {
    noParse: [/dtrace-provider$/, /safe-json-stringify$/, /mv/]
  }
}
