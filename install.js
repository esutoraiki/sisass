const
    fs = require("fs"),
    path = require("path"),
    parsed_args = require("./arg.js").arg;

const
    dest_path = parsed_args.path || "../../",
    dependents = parsed_args.dep || "",
    instances_config_path = path.join(__dirname, "instances.config.js");

let target_path = dest_path;
let base_dir = dest_path === "../../" ? "files/" : "files/assets/";
let after_copy = null;

const roboto_fonts_block = `@include font-face(
    "Roboto", "../fonts/roboto/roboto_regular",
    normal, normal,
    woff2 woff ttf
);

@include font-face(
    "Roboto", "../fonts/roboto/roboto_bold",
    bold, normal,
    woff2 woff ttf
);

@include font-face(
    "Roboto", "../fonts/roboto/roboto_italic",
    normal, italic,
    woff2 woff ttf
);

`;

const copy_directory = (source, target, label, on_complete) => {
    fs.cp(source, target, {recursive: true, force: true}, error => {
        if (error) {
            console.error(`Error copying ${label}:`);
            console.error(error);
            return;
        }
        console.log(`${label} copied to ${target}`);
        if (on_complete) on_complete();
    });
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
        .map(entry => `@import "${entry}";`)
        .join("\n");
};

const generate_instances_file = core_dir => {
    const config = load_instances_config();
    if (!config) {
        return;
    }

    const instances_content = build_instances_content(config);
    if (!instances_content) {
        console.warn("Instances configuration is empty. Skipping _instances.scss generation.");
        return;
    }

    const instances_path = path.join(core_dir, "_instances.scss");
    fs.writeFileSync(instances_path, `${instances_content}\n`, "utf8");
    console.log(`Generated instances file at ${instances_path}`);
};

const resolve_sqhtml_core_dir = destination => {
    const assets_root = destination === "../../"
        ? path.join(destination, "assets")
        : destination;
    return path.join(assets_root, "scss", "core");
};

if (dependents === "sqhtml") {
    const core_dir = resolve_sqhtml_core_dir(target_path);
    after_copy = () => apply_sqhtml_overrides(core_dir);
}

if (dependents === "sqhtml2") {
    target_path = "../../src/scss/core/";
    base_dir = "files/assets/scss/core/";
    after_copy = () => {
        apply_sqhtml_overrides(target_path);
        generate_instances_file(target_path);
    };
}

copy_directory(base_dir, target_path, "Base assets", after_copy);
