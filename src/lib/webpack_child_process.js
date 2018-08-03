// @ts-check
const webpack = require('webpack');
const path = require('path');


const getConfig = function(options) {
    options = options || {};

    return {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, '..', 'dist'),
            filename: 'service-worker.js'
        },
        module: {
            rules: [{
                    test: /\.ts$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.ts', '.json']
        },
        devServer: {
            historyApiFallback: true,
            noInfo: true,
            overlay: true
        },
        performance: {
            hints: false
        },
        devtool: '#eval-source-map'
    };
};
