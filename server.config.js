const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';
const dist = path.join(__dirname, 'server/dist');
const src = path.join(__dirname, 'server/src');

module.exports = {
    mode,
    target: 'node',
    externals: [nodeExternals()],
    devtool: "source-map",
    entry: path.join(src, 'server.ts'),
    stats: "verbose",
    plugins: [
        new CleanWebpackPlugin(),
    ],
    output: {
        path: dist,
        filename: "server.js"
    },
    resolve: {
        extensions: [".ts", ".js", ".json"],
        alias: {
            src: src
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    },
    node: {
        __dirname: false
    }
};
