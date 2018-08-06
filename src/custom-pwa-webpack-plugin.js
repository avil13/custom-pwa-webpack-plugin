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
            file_patterns: /\\.(js\|css\|html)$/,
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

        const runAction = (compilation, callback) => {
            compilation.chunks.forEach(function(chunk) {
                // chunk.files.forEach(function(filename) { var source = compilation.assets[filename].source(); });
                // сохраняем список файлов в параметры
                self.options.files.push(chunk.files);
            });
            // запускаем дочерний процесс, по сборке sw передавая ему список файлов
            createSW(self.options);

            callback();
        };


        if (compiler.hooks) {
            compiler.hooks
                // .afterEmit
                .emit
                .tapAsync(PLUGIN_NAME, runAction);
        } else {
            compiler.plugin('after-emit', runAction);
        }
    }

    isHotUpdateCompilation(assets) {
        return assets.js.length && assets.js.every(name => /\.hot-update\.js$/.test(name));
    }
}


module.exports = CustomPwaWebpackPlugin;
