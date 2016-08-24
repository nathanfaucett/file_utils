var arrayForEach = require("@nathanfaucett/array-for_each"),
    isFunction = require("@nathanfaucett/is_function"),
    readDirSync = require("./readDirSync");


module.exports = diveSync;


function diveSync(directory, options, action) {
    if (isFunction(options)) {
        action = options;
        options = {};
    }

    arrayForEach(readDirSync(directory, options), action);
}