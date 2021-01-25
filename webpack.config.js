// taken from: https://dev.to/robotspacefish/how-i-set-up-webpack-and-babel-with-vanilla-js-2k5e

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: "development",
  // devtool: 'inline-source-map',
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "space-town-bundle.js"
  },
  // optimization: {
  //   runtimeChunk: true
  // },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'assets' },
        { from: 'src/styles'}
      ],
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ],
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
            ]
          }
        }
      },
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3666,
    open: true,
    publicPath: '/'
  }
}