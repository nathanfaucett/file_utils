var fs = require("fs"),
    filePath = require("@nathanfaucett/file_path"),
    mkdirPSync = require("./mkdirPSync");


module.exports = copyFileSymc;


function copyFileSymc(from, to, mode) {
    mode = mode || (mode = 511 & (~process.umask()));

    mkdirPSync(filePath.dirname(to), mode);

    fs.writeFileSync(to, fs.readFileSync(from), {
        mode: mode
    });
}