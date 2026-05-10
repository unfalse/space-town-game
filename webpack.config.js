// taken from: https://dev.to/robotspacefish/how-i-set-up-webpack-and-babel-with-vanilla-js-2k5e

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
    mode: 'source-map',
    // devtool: 'inline-source-map',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'space-town-bundle.js',
        hashFunction: 'xxhash64',
    },
    // optimization: {
    //   runtimeChunk: true
    // },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [{ from: 'assets' }, { from: 'src/styles' }, { from: 'src/server/levels.json', to: 'server' }],
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
        })
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        extensionAlias: {
            '.js': ['.ts', '.js'],
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 3666,
        open: false,
        devMiddleware: {
            publicPath: '/',
        },
    },
};

export default config;
