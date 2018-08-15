const loaderUtils = require('loader-utils');

module.exports = function(content, map, meta) {
    const options = loaderUtils.getOptions(this);

    this.callback(null, replacePatternData(content, options), map, meta);
    return; // always return undefined when calling callback()
};


function replacePatternData(content, options) {
    const { files, version } = options;

    const vers_str = `
const VERSION = '${version}';
const files = [\n'${files.join("',\n'")}'\n];
`;

    return content.replace(/\/\/\s<version_template[^>]*>/gimu, vers_str);
}
