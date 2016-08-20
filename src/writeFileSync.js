var fs = require("fs"),
    isObject = require("@nathanfaucett/is_object"),
    filePath = require("@nathanfaucett/file_path"),
    mkdirPSync = require("./mkdirPSync");


module.exports = writeFileSync;


function writeFileSync(filename, data, options) {
    var dirname, stat, made;

    if (!isObject(options)) {
        options = {};
    }

    dirname = filePath.directory(filename);
    try {
        stat = fs.statSync(dirname);
    } catch (e) {}

    if (!stat || !stat.isDirectory()) {
        made = mkdirPSync(dirname, options.mode);
        if (!made) {
            return false;
        }
    }

    try {
        fs.writeFileSync(filename, data, options);
    } catch (e) {
        return false;
    }

    return true;
}
