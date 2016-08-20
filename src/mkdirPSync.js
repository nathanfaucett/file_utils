var fs = require("fs"),
    isString = require("@nathanfaucett/is_string"),
    filePath = require("@nathanfaucett/file_path");


module.exports = mkdirPSync;


function mkdirPSync(path, mode, made) {
    var stat;

    mode = mode || (mode = 511 & (~process.umask()));
    made = made || (made = null);

    if (isString(mode)) {
        mode = parseInt(mode, 8);
    }

    try {
        fs.mkdirSync(path, mode);
        made = made || path;
    } catch (e) {
        if (e.code === "ENOENT") {
            made = mkdirPSync(filePath.directory(path), mode, made);
            mkdirPSync(path, mode, made);
        } else {
            try {
                stat = fs.statSync(path);
            } catch (error) {
                throw e;
            }
            if (!stat.isDirectory()) {
                throw e;
            }
        }
    }

    return made;
}
