const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: [
    './src/client/index.js',
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '/public/js'),
    publicPath: '/js'
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      'src': path.resolve(__dirname, './src'),
    }
  },
  module: {
    // loaders: [
  //   {
    //     test: /\.js$/,
    //     include: path.join(__dirname, './src/client'),
    //     loader: 'babel-loader',
    //     query: { presets: ['es2015'], blacklist: ['es6.classes'] }
    //   }
    // ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' }
    }),
  ]
}
