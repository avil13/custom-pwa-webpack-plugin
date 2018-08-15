// @ts-check
const webpack = require('webpack');
const path = require('path');

let _compiler;

function getConfig(options) {
    let conf = {
        entry: options.entry,
        output: {
            path: options.dist,
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
            extensions: ['.js', '.ts', '.json']
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


function createSW(params) {
    setTimeout(() => {
        console.log('\n\x1b[36m%s\x1b[0m \x1b[35m%s\x1b[0m\n\x1b[36m%s\x1b[0m \n\x1b[32m%s\x1b[0m',
            'service worker version:',
            params.version,
            'service worker files for caching:',
            (params.files.length ? params.files.join('\n') : '[]')
        );
    }, 0);

    return new Promise((resolve, reject) => {

        if (!_compiler) {
            const options = getConfig(params);
            _compiler = webpack(options);
        }

        _compiler.run((err, state) => {
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

module.exports = { createSW };


// test
const DEBUG = process.argv.includes('--local-debug-mode');

if (DEBUG) {
    createSW({ entry: path.join(__dirname, '../../test/src/sw-test-source.js') });
}
