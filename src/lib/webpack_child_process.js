// @ts-check
const webpack = require('webpack');
const path = require('path');


function getConfig(options) {

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
                    use: [{
                            loader: 'ts-loader'
                        },
                        {
                            loader: 'file-and-version-loader',
                            options
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [{
                            loader: 'babel-loader'
                        },
                        {
                            loader: 'file-and-version-loader',
                            options
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

function createSW(options) {
    options = options || {};

    if (!options.entry) {
        throw new Error('Empty "entry" options in custom-pwa-webpack-plugin ');
    }

    if (!options.version) {
        console.log('Empty "version" in custom-pwa-webpack-plugin ');
        options.version = Date.now();
    }

    if (!options.files) {
        console.log('Empty "files" list for cache in custom-pwa-webpack-plugin ');
        options.files = [];
    }

    runWebpack(options);
}

module.exports = createSW;




// test
const DEBUG = process.argv.includes('--local-debug-mode');

if (DEBUG) {
    runWebpack({ entry: path.join(__dirname, '../../test/src/sw-test-source.js') });
}
