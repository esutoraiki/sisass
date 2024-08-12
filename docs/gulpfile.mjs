/* Update: 20230515 */

"use strict";

import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import { deleteAsync } from "del";
import merge from "merge-stream";
import eslint from "gulp-eslint";
import uglify from "gulp-uglify";
import rename from "gulp-rename";
import jsonlint from "gulp-jsonlint";
import postcss from "gulp-postcss";
import postinlinesvg from "postcss-inline-svg";
import svgmin from "gulp-svgmin";
import logs from "excolor";
import { createRequire } from "module";
import browserSync from "browser-sync";

import arg from "./config/arg.js";
import fn from "./config/fn.js";

const
    p = arg.arg,

    require = createRequire(import.meta.url),
    paths = require("./config/paths.json"),

    { series, parallel, src, dest, task, watch } = gulp,
    sass = gulpSass(dartSass),

    port =  Number(p.port) || Number(arg.p) || 3000,
    port_serve =  Number(p.portServe) || 8125,
    sync = fn.stringToBoolean(p.sync) || false,
    browser = fn.stringToBoolean(p.browser) || false,

    reload = browserSync.reload,

    minjs = fn.stringToBoolean(p.minjs) || false
;

task("svgdel", function (done) {
    logs("");
    logs("%[green]---- SVG-DELETE-FILES ----");
    logs("SVG Files deleted: \n");

    let array_del = [];

    for (let i of paths.svg.img_dest) {
        array_del.push(i + "*svg")
    }

    deleteAsync(array_del, {
        force: true
    }).then(function (files) {
        for (let file of files) {
            logs(file);
        }
        logs("");
        done();
    });
});

task("svgmin", function () {
    logs("");
    logs("%[green]---- SVGO ----");

    let task_array = [];

    for (let i = 0; i < paths.svg.img.length; i++) {
        task_array[i] = src(paths.svg.img[i])
            .pipe(svgmin(
                { removeStyleElement: true },
                { removeComments: true }
            ))
            .pipe(gulp.dest(paths.svg.img_dest[i]));
    }

    logs("");
    return merge(...task_array);
});

task("scss", function () {
    logs("");
    logs("%[blue]---- Styles ----");

    let task_array = [];

    for (let i = 0; i < paths.scss.src.length; i++) {
        task_array[i] = src(paths.scss.src[i])
            .pipe(sass({
                outputStyle: "compressed",
                includePaths: paths.scss.depen
            })
            .on("error", sass.logError))
            .pipe(dest(paths.scss.dest[i]))
        ;
    }

    logs("");
    return merge(...task_array);
});

task("scsssvg", function () {
    logs("");
    logs("%[blue]---- Styles SVG ----");

    let task_array = [];


    for (let i = 0; i < paths.svg.src.length; i++) {
        task_array[i] = src(paths.svg.src[i])
            .pipe(sass({
                outputStyle: "compressed",
                includePaths: paths.scss.depen
            }).on("error", sass.logError))
            .pipe(dest(paths.svg.dest[i]));
    }

    logs("");
    return merge(...task_array);
});

task("process_svg", function () {
    logs("");
    logs("%[green]---- Process SVG ----");

    let task_array = [];

    for (let i = 0; i < paths.svg.dest.length; i++) {
        task_array[i] = src(paths.svg.dest + "*.css")
            .pipe(postcss([
                postinlinesvg({
                    removeFill: false
                })
            ]))
            .pipe(dest(paths.svg.dest));
    }

    logs("");
    return merge(...task_array);
});

task("jsdel", function (done) {
    logs("");
    logs("%[magenta]---- JS-DELETE-FILES ----");

    logs("JS Files deleted: \n");

    let array_del = [];

    for (let i of paths.js.mindest) {
        array_del.push(i + "*js")
    }

    deleteAsync(array_del, {
        force: true
    }).then(function (files) {
        for (let file of files) {
            logs(file);
        }
        logs("");
        done();
    });
});

task("jsmin", function () {
    logs("");
    logs("%[magenta]---- JS-MIN ----");

    let task_array = [];

    for (let i = 0; i < paths.js.src.length; i++) {
        task_array[i] = src(paths.js.src[i])
            .pipe(uglify())
            .pipe(rename(function (path) {
                return {
                    dirname: path.dirname,
                    basename: path.basename + ".min",
                    extname: ".js"
                };
            }))
            .pipe(dest(paths.js.mindest[i]));
    }

    logs("");
    return merge(...task_array);
});

task("jslint", function() {
    logs("");
    logs("i%[magenta]---- JS-ES-LINT ----");

    let task_array = [];

    for (let i = 0; i < paths.js.src.length; i++) {
        task_array[i] = src(paths.js.src[i])
            .pipe(eslint({}))
            .pipe(eslint.format())
            .pipe(eslint.results(results => {
                // Called once for all ESLint results.
                logs(`Total Results: ${results.length}`);
                logs(`Total Warnings: ${results.warningCount}`);
                logs(`Total Errors: ${results.errorCount}`);
                logs("");
            }));
    }

    logs("");
    return merge(...task_array);
});


task("jsonlint", function () {
    logs("");
    logs("%[cyan]---- JSON-LINT ----");

    let task_array = [];

    for (let i = 0; i < paths.json.src.length; i++) {
        task_array[i] = src(paths.json.src[i])
            .pipe(jsonlint())
            .pipe(jsonlint.reporter());
    }

    logs("");
    return merge(...task_array);
});

task("cleanfiles", function (done) {
    console.log("");
    console.log("%[red]---- CLEAN FILES ----");

    deleteAsync(paths.clean, {
        force: true
    }).then(function (files) {
        console.log("Files and directories that would be deleted: ");
        for (let file of files) {
            console.log(file);
        }

        console.log("");
        done();
    });
});

task("browserSync", function() {
    console.log("");
    console.log("---- INICIADO BROWSERSYNC ----");

    browserSync.init({
        proxy: "http://localhost:" + port_serve,
        open: false,
        notify: false,
        port: port,
        codeSync: sync,
        reloadDelay: 2000
    });
});

function list_files(path) {
    logs("%[yellowBright|bgBlack]-----");
    logs("%[yellowBright|bgBlack]File: %[yellow]" + path);
}

function watchFiles() {
    logs("");
    logs("%[yellowBright|bgRed]---- START WATCH FOR SQHTML ----");
    logs("");

    // SCSS //
    watch(paths.scss.src, series("scss")).on("change", list_files);
    watch(paths.scss.core, parallel(
        "scss",
        series(
            "scsssvg",
            "process_svg",
        )
    )).on("change", list_files);

    // JS //
    watch(paths.js.src, series(
        "jslint",
    )).on("change", list_files);

    if (minjs) {
        watch(paths.js.src, series(
            "jsdel",
            "jsmin"
        )).on("change", list_files);
    }

    // JSON //
    watch(paths.json.src, series(
        "jsonlint",
    )).on("change", list_files);

    // SVG //
    watch(paths.svg.img, series(
        "svgdel",
        "svgmin",
        "scsssvg",
        "process_svg",
    )).on("change", list_files);

    watch(paths.svg.src, series(
        "scsssvg",
        "process_svg",
    )).on("change", list_files);
}

export { watchFiles as watch };

const build = (browser === true)
    ? gulp.parallel(watchFiles, "browserSync")
    : gulp.series(watchFiles)
;

export default build;
