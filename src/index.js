var fs = require("fs"),
    each = require("each"),
    type = require("type"),
    filePath = require("file_path");


var fileUtils = module.exports;


function noop() {}

function mixin(a, b) {
    var key, value;

    for (key in b) {
        if (a[key] == null && (value = b[key]) != null) a[key] = value;
    }
    return a;
}

fileUtils.diveDefaults = {
    all: false,
    recursive: true,
    files: true,
    directories: false
};

fileUtils.readDir = function(dir, opts, callback) {
    var out = [],
        todo = 1;

    if (type.isObject(dir)) {
        callback = opts;
        opts = dir;
        dir = process.cwd();
    }
    if (type.isFunction(opts)) {
        callback = opts;
        opts = {};
    }

    opts = mixin(opts || {}, fileUtils.diveDefaults);

    (function doDive(dir) {
        fs.readdir(dir, function(err, files) {
            todo--;

            if (err) {
                callback(err);
                return;
            }

            each(files, function(file) {
                var fullPath, stat;

                if (opts.all || file[0] !== ".") {
                    fullPath = filePath.resolve(dir, file);

                    todo++;

                    try {
                        stat = fs.statSync(fullPath);
                    } catch (err) {
                        todo--;
                        callback(err);
                        return false;
                    }

                    if (stat && stat.isDirectory()) {
                        if (opts.directories) {
                            todo--;
                            stat.path = fullPath;
                            out.push(stat);
                            return true;
                        }
                        if (opts.recursive) doDive(fullPath);
                    } else {
                        if (opts.files) {
                            todo--;
                            stat.path = fullPath;
                            out.push(stat);
                            return true;
                        }
                        if (!--todo) callback(null, out);
                    }

                    return true;
                }

                return true;
            });

            if (!todo) callback(null, out);
        });
    }(dir));
};

fileUtils.readDirSync = function(dir, opts) {
    var out = [],
        todo = 1;

    if (type.isObject(dir)) {
        opts = dir;
        dir = process.cwd();
    }

    opts = mixin(opts || {}, fileUtils.diveDefaults);

    (function doDive(dir) {
        var files;

        try {
            files = fs.readdirSync(dir);
        } catch (err) {
            return;
        }

        todo--;

        each(files, function(file) {
            var fullPath, stat;

            if (opts.all || file[0] !== ".") {
                fullPath = filePath.resolve(dir, file);

                todo++;

                try {
                    stat = fs.statSync(fullPath);
                } catch (err) {
                    todo--;
                    return false;
                }

                if (stat && stat.isDirectory()) {
                    if (opts.directories) {
                        todo--;
                        stat.path = fullPath;
                        out.push(stat);
                        return true;
                    }
                    if (opts.recursive) doDive(fullPath);
                } else {
                    if (opts.files) {
                        todo--;
                        stat.path = fullPath;
                        out.push(stat);
                        return true;
                    }
                }

                return true;
            }

            return true;
        });
    }(dir));

    return out;
};

fileUtils.dive = function(dir, opts, action, callback) {
    if (type.isFunction(opts)) {
        callback = action;
        action = opts;
        opts = {};
    }
    if (!type.isFunction(callback)) callback = noop;

    fileUtils.readDir(dir, opts, function(err, files) {
        var tasks, index, length,
            called;

        if (err) {
            callback(err);
            return;
        }

        tasks = each.map(files, function(file) {
            return function task(next) {
                action(file, next);
            };
        });

        length = tasks.length;
        index = 0;
        called = false

        (function next(err) {
            if (called) return;

            if (err || index >= length) {
                called = true;
                callback(err);
                return;
            }

            try {
                tasks[index++](next);
            } catch (e) {
                called = true;
                callback(e);
            }
        }());
    });
};

fileUtils.diveSync = function(dir, opts, action) {
    if (type.isFunction(opts)) {
        action = opts;
        opts = {};
    }

    each(fileUtils.readDirSync(dir, opts), function(file) {
        try {
            action(file);
        } catch (e) {
            return false;
        }

        return true;
    });
};

fileUtils.mkdirP = function(path, mode, callback, made) {
    if (type.isFunction(mode)) {
        callback = mode;
        mode = 511 & (~process.umask());
    }
    if (!made) made = null;

    callback || (callback = noop);

    mode || (mode = 511 & (~process.umask()));
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

    if (type.isString(mode)) mode = parseInt(mode, 8);

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

fileUtils.writeFile = function(filename, data, options, callback) {
    if (type.isFunction(options)) {
        callback = options;
        options = {};
    }

    fileUtils.mkdirP(filePath.dir(filename), options.mode, function(err) {
        if (err) {
            callback(err);
            return;
        }

        fs.writeFile(filename, data, options, function(err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
            return;
        });
    });
};

fileUtils.writeFileSync = function(filename, data, options) {
    var made;

    if (type.isFunction(options)) {
        callback = options;
        options = {};
    }

    made = fileUtils.mkdirPSync(filePath.dir(filename), options.mode);
    if (!made) {
        return false;
    }

    try {
        fs.writeFileSync(filename, data, options);
    } catch (e) {
        return false;
    }

    return true;
};

fileUtils.copyFile = function(from, to, mode, callback) {
    var called = false;

    if (type.isFunction(mode)) {
        callback = mode;
        mode = null;
    }
    mode || (mode = 511 & (~process.umask()));

    function done(err) {
        if (!called) {
            callback(err);
            called = true;
        }
    }

    fileUtils.mkdirP(filePath.dir(to), mode, function(err) {
        var read, write;

        if (err) {
            callback(err);
            return;
        }

        read = fs.createReadStream(from),
        write = fs.createWriteStream(to);

        read.on("error", done);

        write.on("error", done);
        write.on("close", function() {
            done();
        });

        read.pipe(write);
    });
};

fileUtils.copy = function(from, to, mode, callback) {
    var called = false;

    if (type.isFunction(mode)) {
        callback = mode;
        mode = null;
    }
    mode || (mode = 511 & (~process.umask()));

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

    fileUtils.mkdirP(to, mode, function(err) {
        if (err) {
            callback(err);
            return;
        }

        fileUtils.dive(from,
            function(file, next) {
                fileUtils.copyFile(
                    file.path,
                    filePath.resolve(to, file.path.substring(from.length)),
                    mode,
                    function(err) {
                        if (err) {
                            next(err);
                            return;
                        }
                        next();
                    }
                );
            },
            function(err) {
                if (err) {
                    done(err);
                    return;
                }
                done();
            }
        );
    });
};
