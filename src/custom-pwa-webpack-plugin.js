// @ts-check

const glob = require('glob');
const createSW = require('./lib/webpack_child_process');

/*
    получаем параметры,
    получаем список файлов по регулярке из параметра,
    сохраняем список фалов для кэша
    запускаем компайлер для sw скрипта
    добавляем в sw список файлов для кэширования и версию
    компайлер сохраняет итоговый файл sw
*/

const PLUGIN_NAME = 'CustomPwaWebpackPlugin';
// HACK for webpack <4 and Nuxt
let _count_of_runs = 0;


/** @typedef {import("webpack/lib/Compiler")} Compiler */

class CustomPwaWebpackPlugin {
    constructor(options) {
        if (!options) {
            throw new Error('Set some options in custom-pwa-webpack-plugin');
        }

        if (options.file_patterns && !(options.file_patterns instanceof RegExp)) {
            throw new Error('"file_patterns" mast be instanceof RegExp in custom-pwa-webpack-plugin');
        }

        if (!options.entry) {
            throw new Error('Empty "entry" options in custom-pwa-webpack-plugin ');
        }

        this.options = Object.assign({}, {
            name: 'service-worker.js',
            file_pattern: /\.(js|css|html)$/i,
            file_prefix: '/',
            files: []
        }, options);
    }

    /**
     * Apply the plugin
     * @param {Compiler} compiler Webpack Compiler
     * @returns {void}
     */
    apply(compiler) {
        const self = this;
        // HACK for webpack <4 and Nuxt
        ++_count_of_runs;

        if (self.options.num_runned) {
            console.log('\x1b[33m%s\x1b[0m', `with option "num_runned" run just one iteration, current num:`, _count_of_runs);

            if (self.options.num_runned !== _count_of_runs) {
                return;
            }
        }

        const collectFiles = function(compilation, callback) {
            compilation.chunks.forEach(function(chunk) {
                chunk.files.forEach(function(filename) {
                    // var source = compilation.assets[filename].source();
                    // сохраняем список файлов в параметры
                    if (self.options.file_pattern.test(filename)) {
                        self.options.files.push(
                            `${self.options.file_prefix}${filename}`
                        );
                    }
                });
            });

            if (!self.options.version) {
                self.options.version = compilation.hash;
            }

            // запускаем дочерний процесс, по сборке sw передавая ему список файлов
            createSW(self.options)
                .then(opt => {
                    for (let k in opt.assets) {
                        if (opt.assets.hasOwnProperty(k)) {
                            compilation.assets[k] = opt.assets[k]
                        }
                    }
                    opt.fileDependencies.forEach((context) => {
                        // if (Array.isArray(compilation.fileDependencies)) {
                        //     compilation.fileDependencies.push(context)
                        // } else {
                        compilation.fileDependencies.add(context);
                        // }
                    });

                    opt.contextDependencies.forEach((context) => {
                        // if (Array.isArray(compilation.contextDependencies)) {
                        //     compilation.contextDependencies.push(context)
                        // } else {
                        compilation.contextDependencies.add(context);
                        // }
                    });
                })
                .then(() => {
                    callback && callback();
                })
                .catch((err) => console.log(err));
        };


        if (compiler.hooks) {
            // // собираем список всех файлов
            compiler.hooks
                // .shouldEmit
                .afterCompile
                .tap(PLUGIN_NAME, collectFiles.bind(this));

            // if (self.options.watch) {
            //     compiler.hooks
            //         .afterCompile
            //         .tap(PLUGIN_NAME, this.addWatch(self.options.watch));
            // }
        } else {
            compiler.plugin('should-emit', collectFiles);

            if (self.options.watch) {
                compiler.plugin('after-compile', this.addWatch(self.options.watch));
            }
        }
    }

    addWatch(watch) {
        return (compilation, callback) => {
            glob.sync(watch).forEach((file) => {
                if (Array.isArray(compilation.fileDependencies)) {
                    compilation.fileDependencies.push(file)
                } else {
                    compilation.fileDependencies.add(file);
                }
            });

            callback && callback();
        }
    }

    isHotUpdateCompilation(assets) {
        return assets.js.length && assets.js.every(name => /\.hot-update\.json$/.test(name));
    }
}


module.exports = CustomPwaWebpackPlugin;
