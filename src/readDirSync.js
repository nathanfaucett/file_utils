var fs = require("fs"),
    arrayForEach = require("@nathanfaucett/array-for_each"),
    isObject = require("@nathanfaucett/is_object"),
    mixin = require("@nathanfaucett/mixin"),
    filePath = require("@nathanfaucett/file_path"),
    fileUtils = require("./");


module.exports = readDirSync;


function readDirSync(directory, options) {
    var out = [],
        todo = 1;

    if (isObject(directory)) {
        options = directory;
        directory = process.cwd();
    }

    options = mixin(options || {}, fileUtils.defaults);

    (function doDive(directory) {
        var files;

        files = fs.readdirSync(directory);
        todo--;

        arrayForEach(files, function eachFile(file) {
            var fullPath, stat;

            if (options.all || file[0] !== ".") {
                fullPath = filePath.resolve(directory, file);

                todo++;

                try {
                    stat = fs.statSync(fullPath);
                } catch (error) {
                    todo--;
                    return false;
                }

                if (stat && stat.isDirectory()) {
                    if (options.directories) {
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
                        return false;
                    }
                }

                return true;
            }

            return true;
        });
    }(directory));

    return out;
}
