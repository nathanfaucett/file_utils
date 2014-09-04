var fileUtils = require("../src");

fileUtils.dive("../node_modules/utils",
    function(err, fullPath) {
        console.log(fullPath);
    },
    function() {
        console.log("done");
    }
);
