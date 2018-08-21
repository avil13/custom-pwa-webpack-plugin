// @ts-check
const createSW = require('./lib/webpack_child_process').createSW;

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
            name: 'service-worker.js',
            file_pattern: /\.(js|css|html)$/i,
            file_prefix: '/',
            files: [],
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
            console.log('\x1b[33m%s\x1b[0m', `with option "num_runned" run just one iteration, current num:`, _count_of_runs);
            if (this.options.num_runned !== _count_of_runs) {
                return;
            }
        }

        // собираем список всех файлов
        if (compiler.hooks) {
            // WEBPACK 4
            compiler.hooks // .shouldEmit
                .done
                .tapPromise(PLUGIN_NAME, this.onDone.bind(this));
        } else {
            // WEBPACK <4
            // compiler.plugin('after-compile', this.collectFiles.bind(this));
            compiler.plugin('done', this.onDone.bind(this));
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
        this.options.files = Object.keys(compilation.assets)
            .filter(filename => this.options.file_pattern.test(filename))
            .map(filename =>
                `${this.options.file_prefix}${filename}`
            );

        if (!this.options._version) {
            this.options.version = compilation.hash;
        }
        if (!this.options.dist) {
            this.options.dist = compilation.outputPath;
        }

        // запускаем дочерний процесс, по сборке sw передавая ему список файлов
        return createSW(this.options)
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
