var fs = require("fs"),
    tape = require("tape"),
    filePath = require("@nathanfaucett/file_path"),
    fileUtils = require("..");


tape("setup", function(assert) {
    try {
        fs.mkdirSync(__dirname + "/.test");
    } catch (e) {}
    assert.end();
});

tape("fileUtils.copy(from, to[, mode[, callback]])", function(assert) {
    fileUtils.copy(__dirname + "/folder", __dirname + "/.test/copy_async_folder", function(error) {
        assert.equal(!!fileUtils.statSync(__dirname + "/.test/copy_async_folder/subfolder/d.js"), true);
        assert.end(error);
    });
});
tape("fileUtils.copySync(from, to[, mode])", function(assert) {
    fileUtils.copySync(__dirname + "/folder", __dirname + "/.test/copy_sync_folder");
    assert.equal(!!fileUtils.statSync(__dirname + "/.test/copy_sync_folder/subfolder/d.js"), true);
    assert.end();
});

tape("fileUtils.dive(dir[, opts[, action [, callback]]])", function(assert) {
    var count = 0;

    function action(stat, next) {
        count += 1;
        next();
    }

    fileUtils.dive(__dirname + "/folder", action, function() {
        assert.equals(count, 5);
        assert.end();
    });
});
tape("fileUtils.diveSync(dir[, opts[, action [, callback]]])", function(assert) {
    var count = 0;

    function action() {
        count += 1;
    }

    fileUtils.diveSync(__dirname + "/folder", action);
    assert.equals(count, 5);
    assert.end();
});

tape("fileUtils.remove(path[, callback])", function(assert) {
    fileUtils.remove(__dirname + "/.test/copy_async_folder/subfolder", function(error) {
        try {
            fileUtils.statSync(__dirname + "/.test/copy_async_folder/subfolder");
        } catch (e) {
            assert.equals(!!e, true);
        }
        assert.end(error);
    });
});
tape("fileUtils.removeSync(path[, callback])", function(assert) {
    fileUtils.removeSync(__dirname + "/.test/copy_sync_folder/subfolder");
    try {
        fileUtils.statSync(__dirname + "/.test/copy_async_folder/subfolder");
    } catch (e) {
        assert.equals(!!e, true);
    }
    assert.end();
});

tape("fileUtils.readDir(dir[, opts[, callback]])", function(assert) {
    fileUtils.readDir(__dirname + "/folder", function(error, stats) {
        assert.deepEquals(stats.map(function(stat) {
            return filePath.base(stat.path);
        }), ['a.js', 'b.js', 'c.js', 'd.js', "e.js"]);
        assert.end();
    });
});
tape("fileUtils.readDirSync(dir[, opts[, callback]])", function(assert) {
    assert.deepEquals(fileUtils.readDirSync(__dirname + "/folder").map(function(stat) {
        return filePath.base(stat.path);
    }), ['a.js', 'b.js', 'c.js', 'd.js', "e.js"]);
    assert.end();
});

tape("fileUtils.writeFile(filename, data[, options[, callback]])", function(assert) {
    fileUtils.writeFile(__dirname + "/.test/async/file.js", new Buffer("function file() {}"), function(error) {
        if (error) {
            assert.equal(!!fileUtils.statSync(__dirname + "/.test/async.js"), true);
            assert.end(error);
        } else {
            fileUtils.writeFile(__dirname + "/.test/async.js", new Buffer("function async() {}"), function(error) {
                assert.equal(!!fileUtils.statSync(__dirname + "/.test/async.js"), true);
                assert.end(error);
            });
        }
    });
});
tape("fileUtils.writeFileSync(dir[, opts[, callback]])", function(assert) {
    fileUtils.writeFileSync(__dirname + "/.test/sync/file.js", new Buffer("function file() {}"));
    fileUtils.writeFileSync(__dirname + "/.test/sync.js", new Buffer("function sync() {}"));


    assert.equal(!!fileUtils.statSync(__dirname + "/.test/sync/file.js"), true);
    assert.equal(!!fileUtils.statSync(__dirname + "/.test/sync.js"), true);

    assert.end();
});

tape("teardown", function(assert) {
    fileUtils.removeSync(__dirname + "/.test");
    assert.end();
});