const
    arg = require("./arg.js").arg
    fs = require("fs"),

    dest = arg.path || "../../",
    filesDir = arg.dir || "files/"
;

// Copy files to the project
fs.cp(filesDir, dest, {recursive: true, force: false}, (err, data) => {
    if (err) {
        console.error("Error Install: ");
        console.error(err);
    } else {
        console.log("successful resource installation");
    }
});

