var fs = require("fs");


var fileUtils = exports;


fileUtils.defaults = require("./defaults");


fileUtils.readDir = require("./readDir");
fileUtils.readDirSync = require("./readDirSync");

fileUtils.dive = require("./dive");
fileUtils.diveSync = require("./diveSync");

fileUtils.mkdirP = require("./mkdirP");
fileUtils.mkdirPSync = require("./mkdirPSync");

fileUtils.writeFile = require("./writeFile");
fileUtils.writeFileSync = require("./writeFileSync");

fileUtils.copyFile = require("./copyFile");
fileUtils.copyFileSync = require("./copyFileSync");

fileUtils.copy = require("./copy");
fileUtils.copySync = require("./copySync");

fileUtils.remove = require("./remove");
fileUtils.removeSync = require("./removeSync");

fileUtils.stat = fs.stat;
fileUtils.statSync = fs.statSync;