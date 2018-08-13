// @ts-check

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

        self.options.dist = self.options.dist || compiler.options.output.path;
        self.options.mode = self.options.mode || compiler.options.mode;

        const collectFiles = (compilation, callback) => {
            if (self.options.files.length) {
                callback && callback();
                return true;
            }
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

            runWorkWithSW(compilation)
                .then(assets => {
                    for (let k in assets) {
                        if (assets.hasOwnProperty(k)) {
                            compilation.assets[k] = assets[k]
                        }
                    }
                })
                .then(() => {
                    callback && callback();
                });
            //
                return true;
        };

        //
        const runWorkWithSW = (compilation, callback) => {
            if (!self.options.version) {
                self.options.version = compilation.hash;
            }

            setTimeout(() => {
                console.log('\n\x1b[36m%s\x1b[0m \x1b[35m%s\x1b[0m\n\x1b[36m%s\x1b[0m \n\x1b[32m%s\x1b[0m',
                    'service worker version:',
                    self.options.version,
                    'service worker files for caching:',
                    (self.options.files.length ? self.options.files.join('\n') : '[]')
                );
            }, 0);
            // запускаем дочерний процесс, по сборке sw передавая ему список файлов
            return createSW(self.options);
        };

        if (compiler.hooks) {
            // // собираем список всех файлов
            compiler.hooks
                .shouldEmit
                .tap(PLUGIN_NAME, collectFiles);
        } else {
            compiler.plugin('should-emit', collectFiles);
        }
    }

    isHotUpdateCompilation(assets) {
        return assets.js.length && assets.js.every(name => /\.hot-update\.js$/.test(name));
    }
}


module.exports = CustomPwaWebpackPlugin;
