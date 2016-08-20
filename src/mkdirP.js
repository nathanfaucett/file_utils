var fs = require("fs"),
    isFunction = require("@nathanfaucett/is_function"),
    isString = require("@nathanfaucett/is_string"),
    emptyFunction = require("@nathanfaucett/empty_function"),
    filePath = require("@nathanfaucett/file_path");


module.exports = mkdirP;


function mkdirP(path, mode, callback, made) {
    if (isFunction(mode)) {
        callback = mode;
        mode = 511 & (~process.umask());
    }
    if (!made) {
        made = null;
    }

    callback = callback || emptyFunction;

    mode = mode || (mode = 511 & (~process.umask()));
    if (isString(mode)) {
        mode = parseInt(mode, 8);
    }

    fs.mkdir(path, mode, function(e) {
        if (!e) {
            made || (made = path);
            callback(undefined, made);
        } else {
            if (e.code === "ENOENT") {
                mkdirP(filePath.directory(path), mode, function onMkdirP(error, made) {
                    if (error) {
                        callback(error, made);
                    } else {
                        mkdirP(path, mode, callback, made);
                    }
                });
            } else {
                fs.stat(path, function onStat(error, stat) {
                    if (error || !stat.isDirectory()) {
                        callback(error, made);
                    } else {
                        callback(undefined, made);
                    }
                });
            }
        }
    });
}
