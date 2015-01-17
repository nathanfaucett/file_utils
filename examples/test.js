var fileUtils = require("../src");

/*
fileUtils.dive(__dirname + "/../node_modules/each",
    function(file, next) {
        //console.log(file.path);
        next();
    },
    function(err) {
        if (err) {
            console.log(err);
            return;
        }
    
        console.log("done");
    }
);

fileUtils.diveSync(__dirname + "/../node_modules/each", function(file) {
    console.log(file.path);
});
*/

console.time("copied");
fileUtils.copy(__dirname + "/../node_modules/for_each", __dirname + "/for_each", function(err) {
    if (err) {
        console.log(err);
    }

    console.timeEnd("copied");
});
