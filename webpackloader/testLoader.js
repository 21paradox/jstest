const loaderUtils = require('loader-utils');
const fs = require('fs')

module.exports = function (source) {
    if (this.cacheable) this.cacheable();

    const options = loaderUtils.getOptions(this);
    const callback = this.async();

    fs.readFile(this.resourcePath, (err, content) => {
        if (err) {
            callback(err)
            return;
        }
        const contentStr = Buffer.from(content).toString();
        // use md parser 
        const retStr = `
            module.exports = ${JSON.stringify(contentStr)}
        `
        callback(null, retStr);
    })
};
