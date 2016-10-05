var fs = require("fs"),
    diveSync = require("./diveSync");


module.exports = removeSync;


function removeSync(path) {
    var stat = fs.statSync(path);

    if (stat.isDirectory()) {
        diveSync(path, function onAction(file) {
            fs.unlinkSync(file.path);
        });
        diveSync(path, {
                files: false,
                directories: true
            },
            function onAction(file) {
                fs.rmdirSync(file.path);
            }
        );
        fs.rmdirSync(path);
    } else {
        fs.unlinkSync(file.path);
    }
}