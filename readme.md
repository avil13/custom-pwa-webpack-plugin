# custom-pwa-webpack-plugin

### webpack plugin for development and customization service worker

![webpack](img/custom-pwa-webpack-plugin.svg)

<img alt="version" src="https://img.shields.io/npm/v/custom-pwa-webpack-plugin/latest.svg?style=flat-square">

<img alt="downloads" src="https://img.shields.io/npm/dt/custom-pwa-webpack-plugin.svg?style=flat-square">

A plugin to help you create your Progressive Web Apps.

It will suit you if you know what you are doing, and you just need a tool for this.

#### Usage:


Add this code to the script of your service worker. It will be replaced by the same variables. Only with actual values.


`my-service-worker.js`
```JavaScript
// <version_template
const VERSION = '0.1';
const files = [];
// end_version_template>

// ...
```
You can use the files to create a query cache. They will be collected relative to the pattern specified in the options.

Next, connect the plugin and specify the desired options.

`webpack.config.js`
```JavaScript
var path = require('path');
var CustomPwaWebpackPlugin = require('custom-pwa-webpack-plugin');

module.exports = {
    // You config
    entry: path.join(__dirname, './src/index.js'),
    output: {
        filename: 'bundle.js'
    },
    // ...

    plugins: [
        new CustomPwaWebpackPlugin({
            entry: path.join(__dirname, 'my-service-worker.js'),
            dist: path.join(__dirname, 'dist'), 
            version: require('./package').version,
            name: 'service-worker.js',
            file_pattern: /\.(js|css|html)$/
        })
    ]
}



```

| Parameters    | Default                 | Required      | Description  |
|---------------|:------------------------|:-------------:|--------------|
| entry         |                         | true          | The file from which to start the build script (absolute path)
| dist          |                         | false         | The folder to save the script (absolute path)
| version       |                         | false         | Version to create the cache
| name          | 'service-worker.js'     | false         | File name
| file_pattern  | /\\.(js\|css\|html)$/i  | false         | Regular expression for file caching
| file_prefix   | '/'                     | false         | Prefix path for files
| [replace_names](#replace_names) | {}    | false         | Replace full path name for files, 
| mode          | 'production'            | false         | Service Worker build file mode
| num_runned    | 1                       | false         | HACK for webpack <4 and Nuxt
| dev           | false                   | false         | true - if watch mode

> `num_runned` - Need if you start multiple processes, and only one need to run. Then specify the number. For Nuxt is `1`.

---

## Options

##### replace_names


`webpack.config.js`
```JavaScript
var path = require('path');
var CustomPwaWebpackPlugin = require('custom-pwa-webpack-plugin');

module.exports = {
    // You config
    entry: path.join(__dirname, './src/index.js'),
    output: {
        filename: 'bundle.js'
    },
    // ...

    plugins: [
        new CustomPwaWebpackPlugin({
            entry: path.join(__dirname, 'my-service-worker.js'),
            replace_names: {
                // key is will be replaced with value
                '/_nuxt/index.spa.html': '/'
            }
        })
    ]
}
```

---


### Tips for NuxtJs

```JavaScript
// nuxt.config.js

module.exports = {
    build: {
        plugins: [
            new CustomPwaWebpackPlugin({
                entry: path.join(__dirname, 'sw/src/index.js'),
                dist: path.join(__dirname, 'static'),
                version: require('./package').version,
                file_pattern: /\.(html|js|css|woff|woff2|ttf|eot|svg)$/i,
                file_prefix: '/_nuxt/',
                num_runned: 1 // for "npm run generate"
            })
        ]
    }
}
```

In `layout/default.vue` add

```html
<script type="text/javascript">
(function() {
    'use strict';
    // Check to make sure service workers are supported in the current browser,
    // and that the current page is accessed from a secure origin. Using a
    // service worker from an insecure origin will trigger JS console errors.
    const isLocalhost = Boolean(window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

if ('serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            // updatefound is fired if service-worker.js changes.
            registration.onupdatefound = function() {
                // updatefound is also fired the very first time the SW is installed,
                // and there's no need to prompt for a reload at that point.
                // So check here to see if the page is already controlled,
                // i.e. whether there's an existing service worker.
                if (navigator.serviceWorker.controller) {
                    // The updatefound event implies that registration.installing is set
                    const installingWorker = registration.installing;
                    installingWorker.onstatechange = function() {
                        switch (installingWorker.state) {
                            case 'installed':
                                // At this point, the old content will have been purged and the
                                // fresh content will have been added to the cache.
                                // It's the perfect time to display a "New content is
                                // available; please refresh." message in the page's interface.
                                break;
                            case 'redundant':
                                throw new Error('The installing ' +
                                    'service worker became redundant.');
                            default:
                                // Ignore
                        }
                    };
                }
            };
        }).catch(function(e) {
            console.error('Error during service worker registration:', e);
        });
    }
})();
</script>
```
