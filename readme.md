# [wip] custom-pwa-webpack-plugin

### webpack plugin for development and customization service worker

#### Usage:

```JavaScript

// webpack.config.js
var path = require('path');
var CustomPwa = require('custom-pwa-webpack-plugin');

module.exports = {
    // You config
    entry: './src/index.js',
    output: {
        filename: 'bundle.js'
    },
    // ...

    plugins: [
        new CustomPwa({
            version: require('package').version,
            entry: path.join(__dirname__, 'my-service-worker.js'),
            dist: path.join(__dirname__, 'dist'), 
            name: 'service-worker.js',
            file_patterns: /\.(js|css|html)$/
        })
    ]
}

```

| Parameters    | Required      | Default               | Description  |
|---------------|:-------------:|:----------------------|--------------|
| entry         | true          |                       | The file from which to start the build script 
| dist          | false         | 'dist'                | The folder to save the script
| version       | false         |                       | Version to create the cache
| name          | false         | 'service-worker.js'   | File name
| file_patterns | false         | /\\.(js\|css\|html)$/ | Regular expression for file caching
