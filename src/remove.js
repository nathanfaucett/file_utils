var fs = require("fs"),
    dive = require("./dive");


module.exports = remove;


function remove(path, callback) {
    var called = false;

    function done(error) {
        if (!called) {
            callback(error);
            called = true;
        }
    }

    fs.stat(path, function onState(error, stat) {
        if (error) {
            callback(error);
        } else if (stat.isDirectory()) {
            dive(path,
                function onAction(file, next) {
                    fs.unlink(file.path, next);
                },
                function onDone(error) {
                    if (error) {
                        done(error);
                    } else {
                        dive(path, {
                                files: false,
                                directories: true
                            },
                            function onAction(file, next) {
                                fs.rmdir(file.path, next);
                            },
                            function onDone(error) {
                                if (error) {
                                    done(error);
                                } else {
                                    fs.rmdir(path, done);
                                }
                            }
                        );
                    }
                }
            );
        } else {
            fs.unlink(file.path, function(error) {
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });
        }
    });
}