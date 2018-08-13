// @ts-check
const webpack = require('webpack');
const path = require('path');

function getConfig(options) {
    let conf = {
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
        },
        devtool: '#eval-source-map'
    };

    if (options.mode) {
        conf['mode'] = options.mode;
    }

    return conf;
}

const PLUGIN_NAME = 'Child_CustomPwaWebpackPlugin'

function createSW(params) {
    params = params || {};

    return new Promise((resolve, reject) => {
        const options = getConfig(params);
        const compiler = webpack(options);

        compiler.run((err, state) => {
            if (err) {
                throw err; // new Error(err);
            }

            const assets = Object.assign({}, state.compilation.assets);

            resolve({
                assets,
                fileDependencies: state.compilation.fileDependencies,
                contextDependencies: state.compilation.contextDependencies
            });

            for (let k in state.compilation.assets) {
                if (state.compilation.assets.hasOwnProperty(k)) {
                    delete state.compilation.assets[k];
                }
            }
        });
    });
}

module.exports = createSW;


// test
const DEBUG = process.argv.includes('--local-debug-mode');

if (DEBUG) {
    createSW({ entry: path.join(__dirname, '../../test/src/sw-test-source.js') });
}
