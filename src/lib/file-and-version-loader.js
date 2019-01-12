// const loaderUtils = require('loader-utils');
const fvOptions = require('./webpack_child_process').fvOptions;

module.exports = function(content, map, meta) {
    // const options = loaderUtils.getOptions(this);

    // this.callback(null, replacePatternData(content, options), map, meta);
    this.callback(null, replacePatternData(content), map, meta);
    return; // always return undefined when calling callback()
};


function replacePatternData(content, options) {
    // const { files, version } = options;
    const { files, version } = fvOptions();

    const vers_str = `
const VERSION = '${version}';
const files = [\n'${files.join("',\n'")}'\n];
`;

    return content.replace(/\/\/\s<version_template[^>]*>/gimu, vers_str);
}
