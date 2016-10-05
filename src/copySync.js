var filePath = require("@nathanfaucett/file_path"),
    mkdirPSync = require("./mkdirPSync"),
    diveSync = require("./diveSync"),
    copyFileSync = require("./copyFileSync");


module.exports = copySync;


function copySync(from, to, mode) {
    mode = mode || (mode = 511 & (~process.umask()));
    from = filePath.resolve(process.cwd(), from);
    to = filePath.resolve(process.cwd(), to);

    if (from[from.length - 1] !== filePath.separator) {
        from += filePath.separator;
    }
    if (to[to.length - 1] !== filePath.separator) {
        to += filePath.separator;
    }

    mkdirPSync(to, mode);

    diveSync(from, function onAction(file) {
        copyFileSync(
            file.path,
            filePath.resolve(to, file.path.substring(from.length)),
            mode
        );
    });
}