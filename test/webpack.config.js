const path = require('path');
const CustomPwaWebpackPlugin = require('../src/index');

module.exports = {
    mode: 'production',
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js'
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
        new CustomPwaWebpackPlugin()
    ]
};
