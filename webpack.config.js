const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const outputDir = 'dist'

module.exports = {
  entry: './src/client/index.js',
  output: {
    path: path.join(__dirname, outputDir),
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['react']
        }
      }
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },
  devServer: {
    port: 3000,
    open: true,
    historyApiFallback: {
      rewrites: [
        { from: /game\/bundle.js/, to: '/bundle.js' }
      ]
    }
  },
  plugins: [
    new CleanWebpackPlugin([outputDir]),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}
