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
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader'
                        },
                        {
                            loader: 'file-and-version-loader'
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader'
                        },
                        {
                            loader: 'file-and-version-loader'
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.ts', '.json']
        },
        resolveLoader: {
            alias: {
                'file-and-version-loader': path.join(__dirname, './file-and-version-loader')
            }
        }
    };
}


function runWebpack(params) {
    const options = getConfig(params);
    const compiler = webpack(options);

    compiler.run((err, state) => {
        if (err) {
            throw err; // new Error(err);
        }
    });
    // compiler.afterCompile((err, state) => {
    //     if (err) {
    //         throw new Error(err);
    //     }
    // });
}

// test
runWebpack({ entry: path.join(__dirname, 'tst.js') });

function createSW(files, version, options) {
    runWebpack(options);
}


module.exports = createSW;
