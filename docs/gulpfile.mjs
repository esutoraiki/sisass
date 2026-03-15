import gulp from "gulp";
import { deleteAsync } from "del";
import path from "path";
import gulp_sass from "gulp-sass";
import * as dart_sass from "sass";
import eslint from "gulp-eslint-new";
import { optimize } from "svgo";
import { Transform } from "stream";
import postcss from "gulp-postcss";
import postinlinesvg from "postcss-inline-svg";
import jsonlint from "@prantlf/gulp-jsonlint";
import { fileURLToPath } from "url";
import plumber from "gulp-plumber";

const
    sass = gulp_sass(dart_sass),
    file_path = fileURLToPath(import.meta.url),
    dir_path = path.dirname(file_path),
    handle_sass_error = function (error) {
        console.log("");
        console.log(error.messageFormatted || error.message);
        this.emit("end");
    },

    // NOTE: foler core and sisass last element of array
    paths_scss = [
        path.resolve(dir_path, "assets/scss/"),
        path.resolve(dir_path, "assets/scss/core/"),
        path.resolve(dir_path, "../src/scss/")
    ],
    paths_compile_scss = [
        "assets/scss/*.scss",
        "assets/scss/components/*.scss",
        "assets/scss/bases/[^_]*.scss",
        "assets/scss/mediaqueries/[^_]*.scss"
    ],

    path_svg = "assets/scss/svg/*.scss",
    path_dest_svg = "assets/css/svg/",
    paths_process_svg = [
        path_dest_svg + "*.css",
        "assets/css/bases.css"
    ],
    postcss_svg_paths = [
        path.resolve(dir_path, "assets/css/bases"),
        path.resolve(dir_path, "assets/css/svg")
    ],

    path_img_svg = "assets/img/svg/*.svg",
    path_orig_img_svg = "assets/img/svg/orig/*.svg",
    path_dest_img_svg = "assets/img/svg/",

    paths_js = [
        "assets/js/*.js",
        "assets/js/pages/*.js",
        "assets/js/components/*.js"
    ],

    paths_html = [
        "*.html",
    ]
;

gulp.task("delete_svg", function () {
    console.log("");
    console.log("---- SVG ----");

    return deleteAsync(path_img_svg);
});

gulp.task("svgmin", function () {
    const svg_transform = new Transform({
        objectMode: true,
        transform(file, encoding, callback) {
            if (file.isBuffer()) {
                const result = optimize(file.contents.toString(), {
                    path: file.path,
                    plugins: [
                        { name: "preset-default" },
                        { name: "removeStyleElement" },
                        { name: "removeComments" }
                    ]
                });
                file.contents = Buffer.from(result.data);
            }
            callback(null, file);
        }
    });

    return gulp.src(path_orig_img_svg)
        .pipe(svg_transform)
        .pipe(gulp.dest(path_dest_img_svg));
})

gulp.task("process_svg", function () {
    return gulp.src(paths_process_svg, { base: "assets/css" })
        .pipe(postcss([
            postinlinesvg({
                paths: postcss_svg_paths,
                removeFill: true
            })
        ]))
        .pipe(gulp.dest("assets/css"));
})

gulp.task("css_svg", function () {
    console.log("");
    console.log("---- Styles SVG ----");

    return gulp.src(path_svg)
        .pipe(plumber({ errorHandler: handle_sass_error }))
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: paths_scss
        }))
        .pipe(gulp.dest(path_dest_svg));
});

gulp.task("scss", function () {
    console.log("");
    console.log("---- Styles ----");
    console.log("");
    return gulp.src(paths_compile_scss, { base: "assets/scss" })
        .pipe(plumber({ errorHandler: handle_sass_error }))
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: paths_scss
        }))
        .pipe(gulp.dest("assets/css"));
});

gulp.task("lint", function() {
    console.log("");
    console.log("---- ES-LINT ----");

    return gulp.src(paths_js, { allowEmpty: true })
        .pipe(eslint({}))
        .pipe(eslint.format())
        .pipe(eslint.results(results => {
            // Called once for all ESLint results.
            console.log(`Total Results: ${results.length}`);
            console.log(`Total Warnings: ${results.warningCount}`);
            console.log(`Total Errors: ${results.errorCount}`);

            console.log("");
        }));

});

gulp.task("jsonlint", function () {
    console.log("");
    console.log("---- JSON-LINT ----");

    return gulp.src("assets/json/*.json")
        .pipe(jsonlint())
        .pipe(jsonlint.reporter({
            formatter: "prose",
            reporter: "jshint"
        }));
});

gulp.task("html", function () {
    console.log("");
    console.log("---- HTML ----");

    return false;
});

gulp.task("watch", function () {
    console.log("");
    console.log("---- INICIADO WATCH ----");

    gulp.watch(paths_js, gulp.series("lint"));

    gulp.watch("assets/json/*.json", gulp.series("jsonlint"));

    gulp.watch(paths_compile_scss, gulp.series("scss", "process_svg"));
    gulp.watch(path_svg, gulp.series("css_svg", "process_svg"));
    gulp.watch(path_orig_img_svg, gulp.series(
        "delete_svg",
        "svgmin",
        "css_svg",
        "process_svg"
    ));

    gulp.watch("assets/scss/core/*.scss", gulp.parallel(
        "scss",
        gulp.series("css_svg", "process_svg")
    ));

    gulp.watch(paths_html, gulp.series("html"));
});

gulp.task("default", gulp.series("watch"));
