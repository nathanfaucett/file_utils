var fs = require("fs"),
    isObject = require("@nathanfaucett/is_object"),
    filePath = require("@nathanfaucett/file_path"),
    mkdirPSync = require("./mkdirPSync");


module.exports = writeFileSync;


function writeFileSync(filename, data, options) {
    var dirname, stat;

    if (!isObject(options)) {
        options = {};
    }

    dirname = filePath.dirname(filename);
    try {
        stat = fs.statSync(dirname);
    } catch (e) {}

    if (!stat || !stat.isDirectory()) {
        mkdirPSync(dirname, options.mode);
    }

    fs.writeFileSync(filename, data, options);
}