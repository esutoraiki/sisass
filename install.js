const
    fs = require("fs"),
    path = require("path"),
    parsed_args = require("./arg.js").arg;

const
    dest_path = parsed_args.path || "../../",
    dependents = parsed_args.dep || "",
    instances_config_path = path.join(__dirname, "instances.config.js"),
    source_root = path.join(__dirname, "files"),
    source_files = [
        "_variables.scss",
        "_fonts.scss",
        "_mixin.scss",
        "_keyframes.scss",
        "_index.scss",
        "_layout.scss"
    ];

let target_path = dest_path;
let after_copy = null;

const roboto_fonts_block = `@include font-face(
    (
        name: "Roboto",
        path: "../fonts/roboto/roboto_regular"
    )
);

@include font-face(
    (
        name: "Roboto",
        path: "../fonts/roboto/roboto_bold",
        weight: bold
    )
);

@include font-face(
    (
        name: "Roboto",
        path: "../fonts/roboto/roboto_italic",
        style: italic
    )
);

`;

const ensure_directory = directory_path => {
    fs.mkdirSync(directory_path, {recursive: true});
};

const resolve_core_dir = destination => path.join(destination, "assets", "scss", "core");

const copy_core_files = (source_dir, target_dir, label, on_complete) => {
    try {
        ensure_directory(target_dir);

        source_files.forEach(file_name => {
            const source_path = path.join(source_dir, file_name);
            const target_file_path = path.join(target_dir, file_name);

            if (!fs.existsSync(source_path)) {
                throw new Error(`Source file not found at ${source_path}`);
            }

            fs.copyFileSync(source_path, target_file_path);
        });

        console.log(`${label} copied to ${target_dir}`);

        if (on_complete) {
            on_complete();
        }
    } catch (error) {
        console.error(`Error copying ${label}:`);
        console.error(error);
        process.exitCode = 1;
    }
};

const update_variables_sqhtml = core_dir => {
    const variables_path = path.join(core_dir, "_variables.scss");

    if (!fs.existsSync(variables_path)) {
        console.warn(`Variables file not found at ${variables_path}`);
        return;
    }

    let variables_content = fs.readFileSync(variables_path, "utf8");

    if (!/sqhtmlexample/.test(variables_content)) {
        variables_content = variables_content.replace(
            /(\$c2:[^\n]*\n)/,
            `$1/* sqhtmlexample */\n$c3: #1F567B;\n/* end-sqhtmlexample */\n`
        );
    }

    variables_content = variables_content.replace(
        /\$f1:[^\n]*;/,
        '$f1: "Roboto", "sans-serif";'
    );

    variables_content = variables_content.replace(
        /\$i1:[^\n]*;/,
        '$i1: "../../img/svg/";'
    );

    fs.writeFileSync(variables_path, variables_content, "utf8");
    console.log(`Updated SQHTML variables at ${variables_path}`);
};

const update_fonts_sqhtml = core_dir => {
    const fonts_path = path.join(core_dir, "_fonts.scss");

    if (!fs.existsSync(fonts_path)) {
        console.warn(`Fonts file not found at ${fonts_path}`);
        return;
    }

    let fonts_content = fs.readFileSync(fonts_path, "utf8");
    const example_block = /\/\* Example[\s\S]*?\*\/\s*/;

    if (example_block.test(fonts_content)) {
        fonts_content = fonts_content.replace(example_block, roboto_fonts_block);
    } else if (!/roboto_regular/.test(fonts_content)) {
        fonts_content = fonts_content.replace(
            /(\/\/ Font\s*\n)/,
            `$1${roboto_fonts_block}`
        );
    }

    fs.writeFileSync(fonts_path, fonts_content, "utf8");
    console.log(`Updated SQHTML fonts at ${fonts_path}`);
};

const apply_sqhtml_overrides = core_dir => {
    update_variables_sqhtml(core_dir);
    update_fonts_sqhtml(core_dir);
};

const load_instances_config = () => {
    if (!fs.existsSync(instances_config_path)) {
        console.warn(`Instances config not found at ${instances_config_path}`);
        return null;
    }

    delete require.cache[require.resolve(instances_config_path)];
    return require(instances_config_path);
};

const build_instances_content = config => {
    const
        imports = Array.isArray(config.imports) ? config.imports : [];

    return imports
        .map(entry => `@forward "${entry}";`)
        .join("\n");
};

const generate_instances_file = core_dir => {
    const config = load_instances_config();
    if (!config) {
        return;
    }

    const instances_content = build_instances_content(config);
    if (!instances_content) {
        console.warn("Instances configuration is empty. Skipping _index.scss generation.");
        return;
    }

    const instances_path = path.join(core_dir, "_index.scss");
    fs.writeFileSync(instances_path, `${instances_content}\n`, "utf8");
    console.log(`Generated instances file at ${instances_path}`);
};

if (dependents === "sqhtml") {
    const core_dir = resolve_core_dir(target_path);
    after_copy = () => apply_sqhtml_overrides(core_dir);
}

if (dependents === "sqhtml2") {
    target_path = "../../src/core/";
    after_copy = () => {
        apply_sqhtml_overrides(target_path);
        generate_instances_file(target_path);
    };
}

copy_core_files(source_root, dependents === "sqhtml2" ? target_path : resolve_core_dir(target_path), "Base assets", after_copy);
