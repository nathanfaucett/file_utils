var arrayMap = require("@nathanfaucett/array-map"),
    isFunction = require("@nathanfaucett/is_function"),
    emptyFunction = require("@nathanfaucett/empty_function"),
    readDir = require("./readDir");


module.exports = dive;


function dive(directory, options, action, callback) {
    if (isFunction(options)) {
        callback = action;
        action = options;
        options = {};
    }
    if (!isFunction(callback)) {
        callback = emptyFunction;
    }

    readDir(directory, options, function onReadDir(error, files) {
        var tasks, index, length,
            called;

        if (error) {
            callback(error);
        } else {
            tasks = arrayMap(files, function eachFile(file) {
                return function task(next) {
                    action(file, next);
                };
            });

            length = tasks.length;
            index = 0;
            called = false;

            (function next(error) {
                if (!called) {
                    if (error || index >= length) {
                        called = true;
                        callback(error);
                    } else {
                        try {
                            tasks[index++](next);
                        } catch (e) {
                            called = true;
                            callback(e);
                        }
                    }
                }
            }());
        }
    });
}