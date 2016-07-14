fileUtils
=======

file utils for node.js

```javascript
var fileUtils = require("@nathanfaucett/file_utils");


fileUtils.readDir(__dirname + "/folder", function(error, stats) {
    var value = stats.map(function(stat) {
        return filePath.base(stat.path);
    });

    // value === ['a.js', 'b.js', 'c.js', 'd.js'];
});

var values = fileUtils.readDirSync(__dirname + "/folder").map(function(stat) {
    return filePath.base(stat.path);
});
//values = ['a.js', 'b.js', 'c.js', 'd.js'];

var count = 0;

function action(stat, next) {
    count += 1;
    next();
}
fileUtils.dive(__dirname + "/folder", action, function() {
    console.log(count); // 4
});


var count = 0;

function action(stat) {
    count += 1;
}

fileUtils.diveSync(__dirname + "/folder", action);
console.log(count); // 4
```
