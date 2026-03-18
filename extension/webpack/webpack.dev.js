const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    mode: 'development',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.API_BASE': JSON.stringify('http://localhost:3000'),
        }),
    ],
});
