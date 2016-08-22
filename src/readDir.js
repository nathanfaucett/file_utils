var fs = require("fs"),
    arrayForEach = require("@nathanfaucett/array-for_each"),
    isObject = require("@nathanfaucett/is_object"),
    isFunction = require("@nathanfaucett/is_function"),
    mixin = require("@nathanfaucett/mixin"),
    filePath = require("@nathanfaucett/file_path"),
    fileUtils = require("./");


module.exports = readDir;


function readDir(directory, options, callback) {
    var out = [],
        todo = 1;

    if (isObject(directory)) {
        callback = options;
        options = directory;
        directory = process.cwd();
    }
    if (isFunction(options)) {
        callback = options;
        options = {};
    }

    options = mixin(options || {}, fileUtils.defaults);

    (function doDive(directory) {
        fs.readdir(directory, function onReadDir(error, files) {
            todo--;

            if (error) {
                callback(error);
            } else {
                arrayForEach(files, function eachFile(file) {
                    var fullPath, stat;

                    if (options.all || file[0] !== ".") {
                        fullPath = filePath.resolve(directory, file);

                        todo++;

                        try {
                            stat = fs.statSync(fullPath);
                        } catch (error) {
                            todo--;
                            callback(error);
                            return false;
                        }

                        if (stat && stat.isDirectory()) {
                            if (options.directoryectories) {
                                todo--;
                                stat.path = fullPath;
                                out.push(stat);
                                return true;
                            }
                            if (options.recursive) {
                                doDive(fullPath);
                            }
                        } else {
                            if (options.files) {
                                todo--;
                                stat.path = fullPath;
                                out.push(stat);
                                return true;
                            }
                            if (!--todo) {
                                callback(undefined, out);
                                return false;
                            }
                        }

                        return true;
                    }

                    return true;
                });

                if (!todo) {
                    callback(undefined, out);
                }
            }
        });
    }(directory));
}
