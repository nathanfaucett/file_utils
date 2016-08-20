var isFunction = require("@nathanfaucett/is_function"),
    filePath = require("@nathanfaucett/file_path"),
    mkdirP = require("./mkdirP"),
    dive = require("./dive");


module.exports = copy;


function copy(from, to, mode, callback) {
    var called = false;

    if (isFunction(mode)) {
        callback = mode;
        mode = null;
    }

    mode = mode || (mode = 511 & (~process.umask()));

    from = filePath.resolve(process.cwd(), from);
    to = filePath.resolve(process.cwd(), to);

    if (from[from.length - 1] !== filePath.separator) {
        from += filePath.separator;
    }
    if (to[to.length - 1] !== filePath.separator) {
        to += filePath.separator;
    }

    function done(error) {
        if (!called) {
            callback(error);
            called = true;
        }
    }

    mkdirP(to, mode, function(error) {
        if (error) {
            callback(error);
        } else {
            dive(from,
                function onAction(file, next) {
                    fileUtils.copyFile(
                        file.path,
                        filePath.resolve(to, file.path.substring(from.length)),
                        mode,
                        function(error) {
                            if (error) {
                                next(error);
                                return;
                            }
                            next();
                        }
                    );
                },
                function onDone(error) {
                    if (error) {
                        done(error);
                        return;
                    }
                    done();
                }
            );
        }
    });
}
