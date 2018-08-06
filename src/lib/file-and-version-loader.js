//

module.exports = function(content, map, meta) {

    this.callback(null, replacePatternData(content), map, meta);
    return; // always return undefined when calling callback()
};


function replacePatternData(content) {
    let version = 'fuck the system';
    let files = ['1.js', '2.js'];

    const vers_str = `
const VERSION = '${version}';
const files = [\n'${files.join("',\n'")}'\n];
`;

    return content.replace(/\/\/\s<version_template[^>]*>/gimu, vers_str);
}
