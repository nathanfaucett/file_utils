var fs = require("fs"),
    isFunction = require("@nathanfaucett/is_function"),
    filePath = require("@nathanfaucett/file_path"),
    mkdirP = require("./mkdirP");


module.exports = copyFile;


function copyFile(from, to, mode, callback) {
    var called = false;

    if (isFunction(mode)) {
        callback = mode;
        mode = null;
    }
    mode = mode || (mode = 511 & (~process.umask()));

    function done(error) {
        if (!called) {
            callback(error);
            called = true;
        }
    }

    mkdirP(filePath.dirname(to), mode, function onMkdirP(error) {
        var read, write;

        if (error) {
            callback(error);
            return;
        } else {
            read = fs.createReadStream(from);
            write = fs.createWriteStream(to);

            read.on("error", done);

            write.on("error", done);
            write.on("close", function onClose() {
                done();
            });

            read.pipe(write);
        }
    });
}