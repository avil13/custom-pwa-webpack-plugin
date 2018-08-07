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
            dist: 'dist',
            name: 'service-worker.js',
            version: Date.now(),
            file_patterns: /\.(js|css|html)$/gi,
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
        let file_lists = [];

        const collectFiles = (compilation, callback) => {
            compilation.chunks.forEach(function(chunk) {
                chunk.files.forEach(function(filename) {
                    // var source = compilation.assets[filename].source();
                    // сохраняем список файлов в параметры
                    if (self.options.file_patterns.test(filename)) {
                        file_lists.push(filename);
                    }
                });
            });
            callback();
        };

        //
        const runWorkWithSW = (compilation, callback) => {
            self.options.files = file_lists.map(file => `${self.options.file_prefix}${file}`);
            console.log('\n');
            console.log('\x1b[36m%s\x1b[0m', 'service worker version:', self.options.version);
            console.log('\x1b[36m%s\x1b[0m', 'service worker files for caching:');
            console.log(self.options.files.join('\n'));
            console.log('\n');
            // запускаем дочерний процесс, по сборке sw передавая ему список файлов
            createSW(self.options);
            callback();
        };

        if (compiler.hooks) {
            // собираем список всех файлов
            compiler.hooks
                .afterCompile
                .tapAsync(PLUGIN_NAME, collectFiles);

            // работаем с sw файлом
            compiler.hooks
                .afterEmit
                .tapAsync(PLUGIN_NAME, runWorkWithSW);
        } else {
            compiler.plugin('after-compile', collectFiles);
            compiler.plugin('after-emit', runWorkWithSW);
        }
    }

    isHotUpdateCompilation(assets) {
        return assets.js.length && assets.js.every(name => /\.hot-update\.js$/.test(name));
    }
}


module.exports = CustomPwaWebpackPlugin;
