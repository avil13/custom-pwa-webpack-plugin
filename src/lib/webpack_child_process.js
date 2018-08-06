// @ts-check
const webpack = require('webpack');
const path = require('path');


function getConfig(options) {
    options = options || {};

    if (!options.entry) {
        throw new Error('Empty "entry" options in custom-pwa-webpack-plugin ');
    }

    return {
        entry: options.entry,
        output: {
            path: options.dist || path.resolve(__dirname, 'dist'),
            filename: options.name || 'service-worker.js'
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
        devtool: '#eval-source-map'
    };
}


function runWebpack(params) {
    const options = getConfig(params);
    const compiler = webpack(options);
    debugger;
    // compiler.run((err, state) => {
    //     if (err) {
    //         throw new Error(err);
    //     }
    // });
    compiler.afterCompile((err, state) => {
        if (err) {
            throw new Error(err);
        }
    });
}

// test
// runWebpack({ entry: path.join(__dirname, 'tst.js') });

function createSW(files, version, options) {
    runWebpack(options);
}


module.exports = createSW;
