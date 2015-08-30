var fs = require("fs"),
    map = require("map"),
    arrayForEach = require("array-for_each"),
    isObject = require("is_object"),
    isFunction = require("is_function"),
    isString = require("is_string"),
    mixin = require("mixin"),
    emptyFunction = require("empty_function"),
    filePath = require("file_path");


var fileUtils = exports;


fileUtils.defaults = {
    all: false,
    recursive: true,
    files: true,
    directories: false
};

fileUtils.readDir = function(dir, opts, callback) {
    var out = [],
        todo = 1;

    if (isObject(dir)) {
        callback = opts;
        opts = dir;
        dir = process.cwd();
    }
    if (isFunction(opts)) {
        callback = opts;
        opts = {};
    }

    opts = mixin(opts || {}, fileUtils.defaults);

    (function doDive(dir) {
        fs.readdir(dir, function(err, files) {
            todo--;

            if (err) {
                callback(err);
                return;
            }

            arrayForEach(files, function(file) {
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
                        if (opts.recursive) {
                            doDive(fullPath);
                        }
                    } else {
                        if (opts.files) {
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
        });
    }(dir));
};

fileUtils.readDirSync = function(dir, opts) {
    var out = [],
        todo = 1;

    if (isObject(dir)) {
        opts = dir;
        dir = process.cwd();
    }

    opts = mixin(opts || {}, fileUtils.defaults);

    (function doDive(dir) {
        var files;

        files = fs.readdirSync(dir);
        todo--;

        arrayForEach(files, function(file) {
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
                    if (opts.recursive) {
                        doDive(fullPath);
                    }
                } else {
                    if (opts.files) {
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
    }(dir));

    return out;
};

fileUtils.dive = function(dir, opts, action, callback) {
    if (isFunction(opts)) {
        callback = action;
        action = opts;
        opts = {};
    }
    if (!isFunction(callback)) {
        callback = emptyFunction;
    }

    fileUtils.readDir(dir, opts, function(err, files) {
        var tasks, index, length,
            called;

        if (err) {
            callback(err);
            return;
        }

        tasks = map(files, function(file) {
            return function task(next) {
                action(file, next);
            };
        });

        length = tasks.length;
        index = 0;
        called = false;

        (function next(err) {
            if (called) {
                return;
            }

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
    if (isFunction(opts)) {
        action = opts;
        opts = {};
    }

    arrayForEach(fileUtils.readDirSync(dir, opts), action);
};

fileUtils.mkdirP = function(path, mode, callback, made) {
    if (isFunction(mode)) {
        callback = mode;
        mode = 511 & (~process.umask());
    }
    if (!made) {
        made = null;
    }

    callback = callback || emptyFunction;

    mode || (mode = 511 & (~process.umask()));
    if (isString(mode)) {
        mode = parseInt(mode, 8);
    }

    fs.mkdir(path, mode, function(e) {
        if (!e) {
            made || (made = path);
            callback(undefined, made);
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
                    callback(undefined, made);
                }
            });
        }
    });
};

fileUtils.mkdirPSync = function(path, mode, made) {
    var stat;

    mode || (mode = 511 & (~process.umask()));
    made || (made = null);

    if (isString(mode)) {
        mode = parseInt(mode, 8);
    }

    try {
        fs.mkdirSync(path, mode);
        made = made || path;
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
            if (!stat.isDirectory()) {
                throw e;
            }
        }
    }

    return made;
};

fileUtils.writeFile = function(filename, data, options, callback) {
    var dirname;

    if (isFunction(options)) {
        callback = options;
        options = {};
    }

    dirname = filePath.dir(filename);

    fs.stat(dirname, function(err, stat) {

        function writeFile(err) {
            if (err) {
                callback(err);
                return;
            }

            fs.writeFile(filename, data, options, function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(undefined);
                return;
            });
        }

        if (!stat || !stat.isDirectory()) {
            fileUtils.mkdirP(filePath.dir(filename), options.mode, writeFile);
        } else {
            writeFile();
        }
    });
};

fileUtils.writeFileSync = function(filename, data, options) {
    var dirname, stat, made;

    if (!isObject(options)) {
        options = {};
    }

    dirname = filePath.dir(filename);
    try {
        stat = fs.statSync(dirname);
    } catch (e) {}

    if (!stat || !stat.isDirectory()) {
        made = fileUtils.mkdirPSync(dirname, options.mode);
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
};

fileUtils.copyFile = function(from, to, mode, callback) {
    var called = false;

    if (isFunction(mode)) {
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

    if (isFunction(mode)) {
        callback = mode;
        mode = null;
    }

    mode || (mode = 511 & (~process.umask()));

    from = filePath.resolve(process.cwd(), from);
    to = filePath.resolve(process.cwd(), to);

    if (from[from.length - 1] !== "/") {
        from += "/";
    }
    if (to[to.length - 1] !== "/") {
        to += "/";
    }

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
