const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = [{
  entry: './src/client/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'client.js'
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        ws: true,
        target: 'http://localhost:8080'
      }
    },
    historyApiFallback: {
      rewrites: [
        { from: /game\/bundle.js/, to: '/client.js' }
      ]
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist/client']),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}]
