// taken from: https://dev.to/robotspacefish/how-i-set-up-webpack-and-babel-with-vanilla-js-2k5e

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

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
    }),
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // add errors to webpack instead of warnings
      failOnError: true,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    })
  ],
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.(ts|js)$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: "babel-loader",
  //         options: {
  //           presets: [
  //             "@babel/preset-env",
  //           ]
  //         }
  //       }
  //     },
  //   ]
  // },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3666,
    open: true,
    publicPath: '/'
  }
}