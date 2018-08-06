const path = require('path');
const CustomPwaWebpackPlugin = require('../src/custom-pwa-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src/app.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app-[hash].js'
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
    devtool: '#eval-source-map',
    plugins: [
        new CustomPwaWebpackPlugin({
            entry: path.join(__dirname, './src/sw-test-source.js'),
            dist: path.join(__dirname, './dist'),
        })
    ]
};
