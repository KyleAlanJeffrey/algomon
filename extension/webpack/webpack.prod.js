const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({ //FIXME: This is a temporary solution, we should use environment variables instead
            'process.env.API_BASE': JSON.stringify('https://algomon.2rbf5f5gvj.workers.dev'),
        }),
    ],
});
