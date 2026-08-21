import gulp from "gulp";
import { deleteAsync } from "del";
import path from "path";
import { readdir, readFile, writeFile } from "fs/promises";
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
        path.resolve(dir_path, "../src/")
    ],
    paths_compile_scss = [
        "assets/scss/*.scss",
        "assets/scss/components/*.scss",
        "assets/scss/bases/[^_]*.scss",
        "assets/scss/pages/*.scss",
        "assets/scss/vendor/[^_]*.scss",
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

    path_search_index = "assets/json/components/search_index.json",
    path_documentation_pages = path.resolve(dir_path, "pages"),

    paths_html = [
        "*.html",
    ]
;

function decode_html(value = "") {
    return value
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
    ;
}

function get_html_text(value = "") {
    return decode_html(value)
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    ;
}

function get_component_title(value, fallback) {
    const
        group_match = value.match(/<div[^>]*class=["'][^"']*group_title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i),
        title_match = group_match ? group_match[1].match(/<h[1-6][^>]*class=["'][^"']*subtitle[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>/i) : null
    ;

    return title_match ? get_html_text(title_match[1]) : fallback;
}

function get_component_category(value) {
    const
        group_match = value.match(/<div[^>]*class=["'][^"']*group_title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i),
        category_match = group_match ? group_match[1].match(/<h[1-6][^>]*class=["'][^"']*attribute[^"']*["'][^>]*>\s*Tipo:\s*([\s\S]*?)<\/h[1-6]>/i) : null
    ;

    return category_match ? get_html_text(category_match[1]) : "Documentación";
}

function format_page_title(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

async function get_page_files(directory) {
    const
        entries = await readdir(directory, { withFileTypes: true }),
        files = []
    ;

    for (const entry of entries) {
        const entry_path = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await get_page_files(entry_path));
        } else if (entry.isFile() && path.extname(entry.name) === ".html") {
            files.push(entry_path);
        }
    }

    return files;
}

gulp.task("search_index", async function () {
    const
        page_files = await get_page_files(path_documentation_pages),
        index = []
    ;

    for (const page_path of page_files) {
        const
            page_name = path.basename(page_path, ".html"),
            json_path = path.resolve(dir_path, "assets/json/" + page_name + ".json")
        ;

        let page_data;

        try {
            page_data = JSON.parse(await readFile(json_path, "utf8"));
        } catch {
            continue;
        }

        const
            page_source = await readFile(page_path, "utf8"),
            page_title_match = page_source.match(/<title>([\s\S]*?)<\/title>/i),
            page_title = format_page_title(
                page_title_match ? get_html_text(page_title_match[1]).replace(/^Documentación de SISASS\s*\|\s*/i, "") : page_name
            ),
            page_url = path.relative(dir_path, page_path).replaceAll(path.sep, "/"),
            components = page_data.components || []
        ;

        for (const component of components) {
            const component_path = path.resolve(dir_path, "assets", component.url);

            let component_source;

            try {
                component_source = await readFile(component_path, "utf8");
            } catch {
                continue;
            }

            index.push({
                url: page_url,
                anchor: component.node || component.id,
                title: get_component_title(component_source, component.id),
                category: get_component_category(component_source),
                page_title,
                text: get_html_text(component_source)
            });
        }
    }

    await writeFile(
        path.resolve(dir_path, path_search_index),
        JSON.stringify({ items: index }, null, 4) + "\n"
    );
});

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

    gulp.watch([
        "pages/**/*.html",
        "components/**/*.html",
        "assets/json/!(search_index).json"
    ], gulp.series("search_index"));

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

    gulp.watch("assets/scss/pages/*.scss", gulp.series("scss"));

    gulp.watch(paths_html, gulp.series("html"));
});

gulp.task("default", gulp.series("watch"));
