// @ts-check
const webpack = require('webpack');
const path = require('path');

const fvOptions = function (opt) {
    if (opt) {
        fvOptions.options = opt;

        setTimeout(function () {
            console.log('\n\x1b[36m%s\x1b[0m \x1b[35m%s\x1b[0m\n\x1b[36m%s\x1b[0m \n\x1b[32m%s\x1b[0m',
                'service worker version:',
                opt.version,
                'service worker files for caching:',
                (opt.files.length ? opt.files.join('\n') : '[]')
            );
        }, 0);
    } else {
        return fvOptions.options;
    }
}
/** @return {webpack.Configuration} */
function getConfig(options) {
    const conf = {
        mode: options.dev ? 'development' : 'production',
        entry: options.entry,
        output: {
            path: options.dist,
            filename: options.name || 'service-worker.js'
        },
        watch: options.dev,
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
        devtool: options.dev ? '#eval-source-map' : false
    };

    return conf;
}


function createSW(params) {

    fvOptions(params);

    return new Promise((resolve, reject) => {

        const options = getConfig(params);
        webpack(options, (err, stats) => {
            if (err) {
                console.error(err);
                // throw err; // new Error(err);
                reject(err);
            } else {
                const info = stats.toJson();

                if (stats.hasErrors()) {
                    console.error(info.errors);
                }

                if (stats.hasWarnings()) {
                    console.warn(info.warnings);
                }

                const assets = Object.assign({}, stats.compilation.assets);

                resolve({
                    assets,
                    fileDependencies: stats.compilation.fileDependencies,
                    contextDependencies: stats.compilation.contextDependencies
                });

                // for (let k in stats.compilation.assets) {
                //     if (stats.compilation.assets.hasOwnProperty(k)) {
                //         delete stats.compilation.assets[k];
                //     }
                // }
            }
        });
    });
}

module.exports = {
    createSW,
    fvOptions
};


// test
const DEBUG = process.argv.includes('--local-debug-mode');

if (DEBUG) {
    createSW({
        entry: path.join(__dirname, '../../test/src/sw-test-source.js')
    });
}
