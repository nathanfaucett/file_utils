var tape = require("tape"),
    filePath = require("file_path"),
    fileUtils = require("..");


tape("fileUtils #readDir(dir[, opts[, callback]])", function(assert) {
    fileUtils.readDir(__dirname + "/folder", function(error, stats) {
        assert.deepEquals(stats.map(function(stat) {
            return filePath.base(stat.path);
        }), ['a.js', 'b.js', 'c.js', 'd.js']);
        assert.end();
    });
});

tape("fileUtils #readDirSync(dir[, opts[, callback]])", function(assert) {
    assert.deepEquals(fileUtils.readDirSync(__dirname + "/folder").map(function(stat) {
        return filePath.base(stat.path);
    }), ['a.js', 'b.js', 'c.js', 'd.js']);
    assert.end();
});

tape("fileUtils #dive(dir[, opts[, action [, callback]]])", function(assert) {
    var count = 0;

    function action(stat, next) {
        count += 1;
        next();
    }

    fileUtils.dive(__dirname + "/folder", action, function() {
        assert.equals(count, 4);
        assert.end();
    });
});

tape("fileUtils #diveSync(dir[, opts[, action [, callback]]])", function(assert) {
    var count = 0;

    function action(stat) {
        count += 1;
    }

    fileUtils.diveSync(__dirname + "/folder", action);
    assert.equals(count, 4);
    assert.end();
});
