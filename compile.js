var Mincer = require('mincer');
var neat = require('node-neat');
var path = require('path');

var env = new Mincer.Environment("./");
var includePaths = neat.with([
    "assets/css",
    "assets/js"
]);
console.log("Compiling assets from:"),
console.log(includePaths);
includePaths.forEach(path => env.appendPath(path));

var manifest = new Mincer.Manifest(env, './builtAssets');
manifest.compile(["style.css"]);
