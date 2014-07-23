var fs = require("fs"),
    utils = require("utils"),
    filePath = require("file_path");


var fileUtils = module.exports;


fileUtils.diveDefaults = {
    all: false,
    recursive: true,
    files: true,
    directories: false
};

fileUtils.dive = function(dir, opts, action, complete) {
    var todo = 1;

    if (utils.isFunction(opts)) {
        if (utils.isFunction(action)) {
            complete = action;
        } else {
            complete = utils.noop;
        }

        action = opts;
        opts = {};
    } else if (complete == null) {
        complete = utils.noop;
    }
    if (!utils.isString(dir)) dir = process.cwd();

    utils.mixin(opts, fileUtils.diveDefaults);

    (function doDive(dir) {

        fs.readdir(dir, function(err, files) {
            if (err) {
                action(err);
                return;
            }

            todo--;

            utils.each(files, function(file) {
                if (opts.all || file[0] !== ".") {
                    var fullPath = filePath.resolve(dir, file),
                        stat;

                    todo++;

                    try {
                        stat = fs.statSync(fullPath);
                    } catch (err) {
                        todo--;
                        return action(err) !== false;
                    }

                    if (stat) {
                        if (stat.isDirectory()) {
                            if (opts.directories) return action(null, fullPath) !== false;
                            if (opts.recursive) doDive(fullPath);
                        } else {
                            if (opts.files) return action(null, fullPath) !== false;
                        }
                    }

                    return true;
                }

                return true;
            });

            if (!todo) complete();
        });
    }(dir));
};

fileUtils.diveSync = function(dir, opts, action) {
    var todo = 1;

    if (utils.isFunction(opts)) {
        action = opts;
        opts = {};
    }
    if (!utils.isString(dir)) dir = process.cwd();

    utils.mixin(opts, fileUtils.diveDefaults);

    (function doDive(dir) {
        try {
            files = fs.readdirSync(dir);
        } catch (err) {
            action(err);
            return;
        }
        todo--;

        utils.each(files, function(file) {
            if (opts.all || file[0] !== ".") {
                var fullPath = filePath.resolve(dir, file),
                    stat;

                todo++;

                try {
                    stat = fs.statSync(fullPath);
                } catch (err) {
                    todo--;
                    return action(err) !== false;
                }

                if (stat) {
                    if (stat.isDirectory()) {
                        if (opts.directories) return action(null, fullPath) !== false;
                        if (opts.recursive) doDive(fullPath);
                    } else {
                        if (opts.files) return action(null, fullPath) !== false;
                    }
                }

                return true;
            }

            return true;
        });
    }(dir));
};

fileUtils.mkdirP = function(path, mode, callback, made) {
    if (utils.isFunction(mode)) {
        callback = mode;
        mode = 511 & (~process.umask());
    }
    if (!made) made = null;

    callback || (callback = utils.noop);
    if (typeof(mode) === "string") mode = parseInt(mode, 8);

    fs.mkdir(path, mode, function(e) {
        if (!e) {
            made || (made = path);
            callback(null, made);
            return;
        }

        if (e.code === "ENOENT") {
            fileUtils.mkdirP(filePath.dir(path), mode, function(err, made) {
                if (err) {
                    callback(err, made);
                } else {
                    fileUtils.mkdirP(path, mode, callback, made);
                }
            });
        } else {
            fs.stat(path, function(err, stat) {
                if (err || !stat.isDirectory()) {
                    callback(err, made);
                } else {
                    callback(null, made);
                }
            });
        }
    });
};

fileUtils.mkdirPSync = function(path, mode, made) {
    var stat;

    mode || (mode = 511 & (~process.umask()));
    made || (made = null);

    if (utils.isString(mode)) mode = parseInt(mode, 8);

    try {
        fs.mkdirSync(path, mode);
        made || (made = path);
    } catch (e) {
        if (e.code === "ENOENT") {
            made = fileUtils.mkdirPSync(filePath.dir(path), mode, made);
            fileUtils.mkdirPSync(path, mode, made);
        } else {
            try {
                stat = fs.statSync(path);
            } catch (err) {
                throw e;
            }
            if (!stat.isDirectory()) throw e;
        }
    }

    return made;
};

fileUtils.copyFile = function(from, to, mode, callback) {
    if (utils.isFunction(mode)) {
        callback = mode;
        mode = null;
    }
    mode || (mode = 511 & (~process.umask()));
    var called = false;

    function done(err) {
        if (!called) {
            callback(err);
            called = true;
        }
    }

    fileUtils.mkdirP(filePath.dir(to), mode, function(err, made) {
        if (err) {
            callback(err);
            return;
        }
        var read = fs.createReadStream(from),
            write = fs.createWriteStream(to);

        read.on("error", done);

        write.on("error", done);
        write.on("close", function() {
            done(null);
        });

        read.pipe(write);
    });
};

fileUtils.copy = function(from, to, mode, callback) {
    if (utils.isFunction(mode)) {
        callback = mode;
        mode = null;
    }
    mode || (mode = 511 & (~process.umask()));
    var called = false;

    from = filePath.resolve(process.cwd(), from);
    to = filePath.resolve(process.cwd(), to);

    if (from[from.length - 1] !== "/") from += "/";
    if (to[to.length - 1] !== "/") to += "/";

    function done(err) {
        if (!called) {
            callback(err);
            called = true;
        }
    }

    fileUtils.mkdirP(to, mode, function(err, made) {
        if (err) {
            callback(err);
            return;
        }

        fileUtils.dive(from,
            function(err, fullPath) {
                if (err) {
                    done(err);
                    return false;
                }

                fileUtils.copyFile(
                    fullPath,
                    filePath.resolve(to, fullPath.substring(from.length)),
                    mode,
                    function(err) {
                        if (err) console.warn(err.stack || err);
                    }
                );

                return true;
            },
            function() {
                done();
            }
        );
    });
};
