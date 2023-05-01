let
    filesDir = ""
;

const
    arg = require("./arg.js").arg
    fs = require("fs"),

    dest = arg.path || "../../",
    dependents = arg.dep || ""
;

switch (dependents) {
    case "sqhtml":
        filesDir = "files_sqhtml/"
    break;
    default:
        filesDir = (dest === "../../") ? "files/" : "files/assets/"
    break;
}

// Copy files to the project
fs.cp(filesDir, dest, {recursive: true, force: false}, (err, data) => {
    if (err) {
        console.error("Error Install: ");
        console.error(err);
    } else {
        console.log("successful resource installation");
    }
});

