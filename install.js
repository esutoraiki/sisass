const
    fs = require("fs"),

    // args = process.argv.slice(2),
    filesDir = "node_modules/sisass/files/"
;

let
    dest = "./"
;

// Copy files to the project
fs.cp(filesDir, "./", {recursive: true}, (err, data) => {
    if (err) {
        console.error("Error Install");
        console.error(err);
    } else {
        console.log("successful resource installation");
    }
});

