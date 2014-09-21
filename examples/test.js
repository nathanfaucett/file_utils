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

fileUtils.copy(__dirname + "/../node_modules/each", __dirname + "/each", function(err) {
    if (err) {
        console.log(err);
    }

    console.log("copy");
});
