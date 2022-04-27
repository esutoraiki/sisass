const
    fs = require("fs"),

    // args = process.argv.slice(2),
    dest = "./",
    filesDir = "node_modules/sisass/files/"
;

// Copy files to the project
fs.cp(filesDir, dest, {recursive: true}, (err, data) => {
    if (err) {
        console.error("Error Install");
        console.error(err);
    } else {
        console.log("successful resource installation");
    }
});

