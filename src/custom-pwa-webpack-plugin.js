// @ts-check
const createSW = require('./lib/webpack_child_process').createSW;
const fs = require('fs');
const path = require('path');

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

        /** @interface {import("./lib/webpack_child_process")} IConfigOptions */
        this.options = Object.assign({}, {
            run: true,
            name: 'service-worker.js',
            file_pattern: /\.(js|css|html)$/i,
            file_prefix: '/',
            files: [],
            num_runned: 1,
            dev: false,
            replace_names: {},
            _version: options.version
        }, options);
    }


    /**
     * Apply the plugin
     * @param {Compiler} compiler Webpack Compiler
     * @returns {void}
     */
    apply(compiler) {
        // HACK for webpack <4 and Nuxt
        ++_count_of_runs;

        if (this.options.num_runned) {
            if (this.options.num_runned !== _count_of_runs) {
                return;
            }
        }

        // собираем список всех файлов
        if (compiler.hooks) {
            // WEBPACK 4
            if (this.options.dev) {
                compiler.hooks // .shouldEmit
                    .afterEmit
                    .tapPromise(PLUGIN_NAME, this.collectFiles.bind(this));
            } else {
                compiler.hooks // .shouldEmit
                    .done
                    .tapPromise(PLUGIN_NAME, this.onDone.bind(this));
            }
        } else {
            // WEBPACK <4
            if (this.options.dev) {
                compiler.plugin('after-emit', this.collectFiles.bind(this));
            } else {
                compiler.plugin('done', this.onDone.bind(this));
            }
        }
    }


    /**
     * При событии done
     * @param {*} stats
     */
    onDone(stats) {
        return this.collectFiles.call(this, stats.compilation);
    }


    /**
     * Collect files and add watch to sw create
     *
     * @param {*} compilation
     * @param {*} callback
     */
    collectFiles(compilation, callback) {
        const self = this;

        if (!self.options._version) {
            self.options.version = compilation.hash;
        }
        if (!self.options.dist) {
            self.options.dist = compilation.outputPath;
        }

        if (self.options.run === false) {
            const sw_file = path.join(self.options.dist, self.options.name);
            // clear service-worker
            fs.stat(sw_file, function (err, stat) {
                if (err == null) {
                    // File exists
                    fs.unlink(sw_file, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            });

            return callback && callback() || Promise.resolve();
        }

        self.options.files = Object.keys(compilation.assets)
            .filter(filename => self.options.file_pattern.test(filename))
            .map(filename =>
                `${self.options.file_prefix}${filename}`
            )
            .map(name =>
                self.options.replace_names[name] !== undefined ? self.options.replace_names[name] : name
            )
            .filter((item, i, arr) => arr.indexOf(item) === i); // Уникальные значения

        // запускаем дочерний процесс, по сборке sw передавая ему список файлов
        return createSW(self.options)
            .then(opt => {
                for (let k in opt.assets) {
                    if (opt.assets.hasOwnProperty(k)) {
                        compilation.assets[k] = opt.assets[k]
                    }
                }
                opt.fileDependencies.forEach((context) => {
                    if (Array.isArray(compilation.fileDependencies)) {
                        if (compilation.fileDependencies.indexOf(context) === -1) {
                            compilation.fileDependencies.push(context)
                        }
                    } else {
                        if (!compilation.fileDependencies.has(context)) {
                            compilation.fileDependencies.add(context);
                        }
                    }
                });
            })
            .then(() => {
                callback && callback();
            })
            .catch((err) => console.log(err));
    }


    /**
     * [wip] отмена обработки при hot апдейтах
     *
     * @param {Object} assets
     */
    isHotUpdateCompilation(assets) {
        const assets_key = Object.keys(assets);
        return assets_key.length && assets_key.some(name => /\.hot-update\.json$/.test(name));
    }
}


module.exports = CustomPwaWebpackPlugin;
