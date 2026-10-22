const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      fs: false,
      crypto: false,
      path: false,
      stream: false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    static: [
      { directory: path.join(__dirname) },
      { directory: path.join(__dirname, 'dist'), publicPath: '/dist' }
    ],
    port: 8080,
    open: true,
    hot: false,
    liveReload: true
  },
  mode: 'development'
};