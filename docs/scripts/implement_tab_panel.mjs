import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const
    script_directory = path.dirname(fileURLToPath(import.meta.url)),
    docs_directory = path.resolve(script_directory, ".."),
    usage = `Uso:
  npm run tab_panel -- --file components/base/gap.html

Opciones:
  --file <ruta>          Componente HTML que se debe convertir (requerido).
  --id <id>              ID de la raíz. Por defecto: <archivo>_example_tabs.
  --index <número>       container_example que se debe convertir. Por defecto: 1.
  --page-script <ruta>   Script de página. Se infiere desde components/<sección>/.
  --dry-run              Valida la conversión sin escribir archivos.
  --help                 Muestra esta ayuda.

La ruta puede ser relativa a docs/ o a la raíz del repositorio.`,
    option_names = new Set(["file", "id", "index", "page-script"])
;

function fail(message) {
    throw new Error(message);
}

function parse_arguments(argv) {
    const options = {
        dry_run: false,
        help: false
    };

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];

        if (argument === "--dry-run") {
            options.dry_run = true;
            continue;
        }

        if (argument === "--help") {
            options.help = true;
            continue;
        }

        if (!argument.startsWith("--")) {
            fail(`Argumento desconocido: ${argument}`);
        }

        const [raw_name, inline_value] = argument.slice(2).split("=", 2),
            option_name = raw_name.replaceAll("-", "_");

        if (!option_names.has(raw_name)) {
            fail(`Opción desconocida: --${raw_name}`);
        }

        const option_value = inline_value ?? argv[index + 1];

        if (!option_value || (inline_value === undefined && option_value.startsWith("--"))) {
            fail(`Falta el valor de --${raw_name}.`);
        }

        options[option_name] = option_value;

        if (inline_value === undefined) {
            index += 1;
        }
    }

    return options;
}

function resolve_docs_path(file_path) {
    const normalized_path = file_path.replaceAll("\\", "/"),
        path_without_docs = normalized_path.startsWith("docs/")
            ? normalized_path.slice(5)
            : normalized_path,
        absolute_path = path.resolve(docs_directory, path_without_docs),
        relative_path = path.relative(docs_directory, absolute_path);

    if (relative_path.startsWith("..") || path.isAbsolute(relative_path)) {
        fail(`La ruta debe estar dentro de docs/: ${file_path}`);
    }

    return absolute_path;
}

function find_balanced_div_end(source, start_index) {
    const tag_pattern = /<\/?div\b[^>]*>/gi;
    let depth = 0,
        match;

    tag_pattern.lastIndex = start_index;

    while ((match = tag_pattern.exec(source)) !== null) {
        depth += match[0].startsWith("</") ? -1 : 1;

        if (depth === 0) {
            return tag_pattern.lastIndex;
        }
    }

    fail("Se encontró un <div> sin cierre dentro del ejemplo.");
}

function find_example_blocks(source) {
    const opening_pattern = /<div\b(?=[^>]*\bclass="[^"]*\bcontainer_example\b[^"]*")[^>]*>/gi,
        blocks = [];
    let match;

    while ((match = opening_pattern.exec(source)) !== null) {
        const end = find_balanced_div_end(source, match.index);

        blocks.push({
            end,
            opening_tag: match[0],
            start: match.index
        });
        opening_pattern.lastIndex = end;
    }

    return blocks;
}

function find_pre_block(content, language) {
    const opening_pattern = new RegExp(`<pre\\b(?=[^>]*\\bclass="[^"]*\\blanguage-${language}\\b[^"]*")[^>]*>`, "i"),
        match = opening_pattern.exec(content);

    if (!match) {
        fail(`El ejemplo no contiene un bloque language-${language}.`);
    }

    const closing_index = content.indexOf("</pre>", match.index + match[0].length);

    if (closing_index === -1) {
        fail(`El bloque language-${language} no tiene cierre </pre>.`);
    }

    return content.slice(match.index, closing_index + 6);
}

function find_result_block(content) {
    const opening_pattern = /<div\b(?=[^>]*\bclass="[^"]*\bresult\b[^"]*")[^>]*>/i,
        match = opening_pattern.exec(content);

    if (!match) {
        fail("El ejemplo no contiene un bloque div.result.");
    }

    const end = find_balanced_div_end(content, match.index);

    return content.slice(match.index, end);
}

function reindent_block(block, indentation) {
    const lines = block.trim().split("\n"),
        nested_lines = lines.slice(1),
        non_empty_nested_lines = nested_lines.filter((line) => line.trim() !== ""),
        minimum_indentation = non_empty_nested_lines.length > 0
            ? Math.min(...non_empty_nested_lines.map((line) => line.match(/^\s*/)[0].length))
            : 0;

    return lines
        .map((line, index) => {
            if (line.trim() === "") {
                return "";
            }

            const normalized_line = index === 0
                ? line.trimStart()
                : line.slice(minimum_indentation);

            return indentation + normalized_line;
        })
        .join("\n");
}

function build_tab_panel(source, block, panel_id) {
    if (block.opening_tag.includes("data-tab-panel")) {
        fail("El container_example seleccionado ya implementa TabPanel.");
    }

    const opening_end = block.start + block.opening_tag.length,
        content = source.slice(opening_end, block.end - 6),
        result_block = find_result_block(content),
        scss_block = find_pre_block(content, "scss"),
        css_block = find_pre_block(content, "css"),
        html_block = find_pre_block(content, "html"),
        line_start = source.lastIndexOf("\n", block.start) + 1,
        root_indentation = source.slice(line_start, block.start),
        child_indentation = root_indentation + "    ",
        content_indentation = child_indentation + "    ",
        existing_class = block.opening_tag.match(/\bclass="([^"]*)"/i)?.[1] ?? "container_example",
        class_names = existing_class.split(/\s+/).filter(Boolean),
        panel_classes = Array.from(new Set([...class_names, "tab_panel"])).join(" ");

    return `<div
${child_indentation}id="${panel_id}"
${child_indentation}class="${panel_classes}"
${child_indentation}data-tab-panel
${child_indentation}data-active-tab="result"
${root_indentation}>
${child_indentation}<div class="tab_panel_list" data-tab-panel-list>
${content_indentation}<button class="tab_panel_tab" data-tab-panel-tab="result">Resultado</button>
${content_indentation}<button class="tab_panel_tab" data-tab-panel-tab="scss">SCSS</button>
${content_indentation}<button class="tab_panel_tab" data-tab-panel-tab="css">CSS generado</button>
${content_indentation}<button class="tab_panel_tab" data-tab-panel-tab="html">HTML</button>
${child_indentation}</div>

${child_indentation}<div class="tab_panel_panel" data-tab-panel-panel="result">
${reindent_block(result_block, content_indentation)}
${child_indentation}</div>

${child_indentation}<div class="tab_panel_panel" data-tab-panel-panel="scss">
${reindent_block(scss_block, content_indentation)}
${child_indentation}</div>

${child_indentation}<div class="tab_panel_panel" data-tab-panel-panel="css">
${reindent_block(css_block, content_indentation)}
${child_indentation}</div>

${child_indentation}<div class="tab_panel_panel" data-tab-panel-panel="html">
${reindent_block(html_block, content_indentation)}
${child_indentation}</div>
${root_indentation}</div>`;
}

function infer_page_script(component_path) {
    const relative_path = path.relative(docs_directory, component_path).replaceAll(path.sep, "/"),
        match = relative_path.match(/^components\/([^/]+)\//);

    if (!match) {
        fail("No se pudo inferir el script de página. Usa --page-script.");
    }

    return path.join(docs_directory, "assets", "js", "pages", `${match[1]}.js`);
}

function ensure_tab_panel_initialization(source) {
    const import_statement = "import { TabPanel } from \"../libraries/tab_panel.min.js\";",
        generic_selector = "document.querySelectorAll(\"[data-tab-panel]\")";
    let updated_source = source;

    if (updated_source.includes(generic_selector)) {
        if (!updated_source.includes(import_statement)) {
            fail("El script inicializa TabPanel, pero no contiene la importación esperada.");
        }

        return updated_source;
    }

    if (/new\s+TabPanel\s*\(/.test(updated_source)) {
        fail("El script ya tiene una inicialización específica de TabPanel. Cámbiala a la inicialización genérica antes de continuar.");
    }

    if (!updated_source.includes(import_statement)) {
        const imports = Array.from(updated_source.matchAll(/^import .*;$/gm)),
            last_import = imports.at(-1);

        if (!last_import) {
            fail("No se encontró un bloque de imports en el script de página.");
        }

        const import_end = last_import.index + last_import[0].length;

        updated_source = updated_source.slice(0, import_end)
            + `\n${import_statement}`
            + updated_source.slice(import_end);
    }

    const content_load_pattern = /^([ \t]*)await contentLoad\(\{[\s\S]*?^[ \t]*\}\);/m,
        content_load_match = content_load_pattern.exec(updated_source);

    if (!content_load_match) {
        fail("No se encontró await contentLoad({...}); en el script de página.");
    }

    const indentation = content_load_match[1],
        initialization = `

${indentation}const tab_panels = Array.from(document.querySelectorAll("[data-tab-panel]"));

${indentation}for (const tab_panel of tab_panels) {
${indentation}    new TabPanel(tab_panel).init();
${indentation}}
`;

    return updated_source.slice(0, content_load_match.index + content_load_match[0].length)
        + initialization
        + updated_source.slice(content_load_match.index + content_load_match[0].length);
}

async function main() {
    const options = parse_arguments(process.argv.slice(2));

    if (options.help) {
        console.log(usage);
        return;
    }

    if (!options.file) {
        fail(`Debes indicar --file.\n\n${usage}`);
    }

    const component_path = resolve_docs_path(options.file),
        page_script_path = options.page_script
            ? resolve_docs_path(options.page_script)
            : infer_page_script(component_path),
        component_source = await readFile(component_path, "utf8"),
        page_script_source = await readFile(page_script_path, "utf8"),
        example_blocks = find_example_blocks(component_source),
        raw_block_index = options.index ?? "1";

    if (!/^\d+$/.test(raw_block_index) || Number(raw_block_index) < 1) {
        fail("--index debe ser un entero mayor que cero.");
    }

    const block_index = Number(raw_block_index) - 1;

    if (example_blocks.length === 0) {
        fail("No se encontraron bloques container_example en el componente.");
    }

    if (!example_blocks[block_index]) {
        fail(`El componente contiene ${example_blocks.length} bloque(s) container_example; --index ${block_index + 1} no existe.`);
    }

    const selected_block = example_blocks[block_index],
        default_id = `${path.basename(component_path, ".html").replaceAll(/[^a-zA-Z0-9_-]/g, "_")}_example_tabs`,
        panel_id = options.id ?? default_id;

    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(panel_id)) {
        fail("--id debe comenzar con una letra y contener solo letras, números, guiones o guiones bajos.");
    }

    const source_without_selected_block = component_source.slice(0, selected_block.start)
        + component_source.slice(selected_block.end);

    if (new RegExp(`\\bid="${panel_id.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(source_without_selected_block)) {
        fail(`El id "${panel_id}" ya existe en el componente.`);
    }

    const tab_panel_markup = build_tab_panel(component_source, selected_block, panel_id),
        updated_component = component_source.slice(0, selected_block.start)
            + tab_panel_markup
            + component_source.slice(selected_block.end),
        updated_page_script = ensure_tab_panel_initialization(page_script_source),
        component_label = path.relative(docs_directory, component_path),
        script_label = path.relative(docs_directory, page_script_path);

    if (options.dry_run) {
        console.log(`Validación correcta: ${component_label}`);
        console.log(`Script de página: ${script_label}`);
        console.log("No se escribieron archivos (--dry-run).");
        return;
    }

    await Promise.all([
        writeFile(component_path, updated_component, "utf8"),
        writeFile(page_script_path, updated_page_script, "utf8")
    ]);

    console.log(`TabPanel implementado en ${component_label}.`);
    console.log(`Inicialización verificada en ${script_label}.`);
}

main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
});
