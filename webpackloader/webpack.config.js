const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: path.join(__dirname, 'entry.js'),
  externals: [nodeExternals({
    whitelist: []
  })],
  mode: 'none',
  target: 'node',
  output: {
    path: path.join(__dirname, 'out'),
    filename: 'index.js'
  },
  module: {
    rules: [{
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', {
                targets: {
                  node: 'current',
                },
              }],
            ],
          }
        }
      },
      {
        test: /\.md$/,
        loader: require.resolve('./testLoader'),
        options: {
            opt1: '1',
            opt2: '2'
        },
      }
    ]
  }
};
