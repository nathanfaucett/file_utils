var fs = require("fs"),
    isFunction = require("@nathanfaucett/is_function"),
    filePath = require("@nathanfaucett/file_path"),
    mkdirP = require("./mkdirP");


module.exports = writeFile;


function writeFile(filename, data, options, callback) {
    var dirname;

    if (isFunction(options)) {
        callback = options;
        options = {};
    }

    dirname = filePath.directory(filename);

    fs.stat(dirname, function onStat(error, stat) {

        function writeFile(error) {
            if (error) {
                callback(error);
            } else {
                fs.writeFile(filename, data, options, function onWriteFile(error) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(undefined);
                    }
                });
            }
        }

        if (!stat || !stat.isDirectory()) {
            mkdirP(filePath.directory(filename), options.mode, writeFile);
        } else {
            writeFile();
        }
    });
}
