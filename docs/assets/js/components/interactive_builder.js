import { get_interactive_builder_adapter } from "./interactive_builder_adapters.js";

const supported_controls = new Set(["text", "select", "boolean", "color", "border"]);

function clone_value(value) {
    return JSON.parse(JSON.stringify(value));
}

function get_path_value(state, path) {
    return path.split(".").reduce((value, key) => value?.[key], state);
}

function set_path_value(state, path, value) {
    const
        path_parts = path.split("."),
        last_key = path_parts.pop(),
        target = path_parts.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== "object") {
                current[key] = {};
            }

            return current[key];
        }, state)
    ;

    target[last_key] = value;
}

function merge_values(base, overrides = {}) {
    const result = clone_value(base);

    for (const [key, value] of Object.entries(overrides)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            result[key] = merge_values(result[key] || {}, value);
        } else {
            result[key] = value;
        }
    }

    return result;
}

function flatten_paths(value, prefix = "") {
    const paths = [];

    for (const [key, child_value] of Object.entries(value || {})) {
        const path = prefix ? prefix + "." + key : key;

        if (child_value && typeof child_value === "object" && !Array.isArray(child_value)) {
            paths.push(...flatten_paths(child_value, path));
        } else {
            paths.push(path);
        }
    }

    return paths;
}

export function validate_builder_schema(schema, adapter_exists = true) {
    const errors = [];

    if (!schema || typeof schema !== "object") {
        return ["El esquema no es un objeto válido."];
    }

    for (const property of ["id", "mixin", "module", "selector"]) {
        if (typeof schema[property] !== "string" || schema[property].trim() === "") {
            errors.push("Falta la propiedad `" + property + "`.");
        }
    }

    if (!Array.isArray(schema.groups) || !Array.isArray(schema.fields)) {
        errors.push("El esquema debe incluir arrays `groups` y `fields`.");
        return errors;
    }

    const
        group_ids = new Set(),
        field_paths = new Set(),
        scoped_names = new Map()
    ;

    for (const group of schema.groups) {
        if (!group.id || group_ids.has(group.id)) {
            errors.push("Los grupos deben tener ids únicos y no vacíos.");
        }

        group_ids.add(group.id);
    }

    for (const field of schema.fields) {
        if (!field.path || field_paths.has(field.path)) {
            errors.push("Los campos deben tener rutas únicas y no vacías.");
            continue;
        }

        field_paths.add(field.path);

        if (!group_ids.has(field.group)) {
            errors.push("El campo `" + field.path + "` referencia un grupo inexistente.");
        }

        if (!supported_controls.has(field.control)) {
            errors.push("El campo `" + field.path + "` usa un control desconocido.");
        }

        if (field.options_source && !Array.isArray(schema.option_sets?.[field.options_source])) {
            errors.push("El campo `" + field.path + "` referencia opciones inexistentes.");
        }

        const
            scope = field.parent || "root",
            names = [field.key, ...(field.aliases || [])].filter(Boolean),
            known_names = scoped_names.get(scope) || new Set()
        ;

        for (const name of names) {
            if (known_names.has(name)) {
                errors.push("La clave o alias `" + name + "` está duplicada en `" + scope + "`.");
            }

            known_names.add(name);
        }

        scoped_names.set(scope, known_names);

        if (field.preferred_alias && !(field.aliases || []).includes(field.preferred_alias)) {
            errors.push("El alias preferido de `" + field.path + "` no está declarado.");
        }
    }

    for (const preset of schema.presets || []) {
        for (const path of flatten_paths(preset.values)) {
            if (!field_paths.has(path)) {
                errors.push("El preset `" + preset.id + "` referencia el campo inexistente `" + path + "`.");
            }
        }
    }

    for (const [parent, alias] of Object.entries(schema.parent_aliases || {})) {
        if (!schema.fields.some((field) => field.parent === parent) || typeof alias !== "string" || alias.trim() === "" || scoped_names.get("root")?.has(alias)) {
            errors.push("El alias del mapa `" + parent + "` no es válido o coincide con otra clave.");
        }
    }

    if (schema.adapter && !adapter_exists) {
        errors.push("El adapter `" + schema.adapter + "` no está registrado.");
    }

    return [...new Set(errors)];
}

function get_default_state(schema) {
    const state = {};

    for (const field of schema.fields) {
        set_path_value(state, field.path, clone_value(field.default));
    }

    return state;
}

function get_field_options(schema, field) {
    return field.options || schema.option_sets?.[field.options_source] || [];
}

function create_option(option_definition) {
    const
        option = document.createElement("option"),
        is_object = option_definition && typeof option_definition === "object"
    ;

    option.value = is_object ? option_definition.value ?? option_definition.id : option_definition;
    option.textContent = is_object ? option_definition.label : option_definition;

    return option;
}

function create_field_label(schema, field, input_node) {
    const
        label = document.createElement("label"),
        label_text = document.createElement("span"),
        field_id = schema.id + "_" + field.path.replaceAll(".", "_")
    ;

    label.className = "interactive_builder_field" + (field.full ? " interactive_builder_field_full" : "");
    label.htmlFor = field_id;
    label_text.textContent = field.label;

    if (field.help) {
        const help = document.createElement("small");

        help.textContent = " (" + field.help + ")";
        label_text.appendChild(help);
    }

    if (field.control === "color") {
        const output = document.createElement("output");

        output.className = "interactive_builder_color_value";
        output.dataset.builderColorValue = field.path;
        label_text.appendChild(output);
    }

    input_node.id = field_id;
    label.append(label_text, input_node);

    return label;
}

function create_basic_field(schema, field) {
    let input_node;

    if (field.control === "select") {
        input_node = document.createElement("select");
        input_node.className = "interactive_builder_select";

        for (const option of get_field_options(schema, field)) {
            input_node.appendChild(create_option(option));
        }
    } else {
        input_node = document.createElement("input");
        input_node.className = "interactive_builder_input";
        input_node.type = field.control === "color" ? "color" : "text";

        if (field.placeholder) {
            input_node.placeholder = field.placeholder;
        }
    }

    input_node.dataset.builderField = field.path;
    input_node.dataset.builderControl = field.control;

    return create_field_label(schema, field, input_node);
}

function create_boolean_field(schema, field) {
    const
        label = document.createElement("label"),
        input = document.createElement("input"),
        text = document.createElement("span"),
        field_id = schema.id + "_" + field.path.replaceAll(".", "_")
    ;

    label.className = "interactive_builder_check" + (field.full ? " interactive_builder_field_full" : "");
    label.htmlFor = field_id;
    input.id = field_id;
    input.type = "checkbox";
    input.dataset.builderField = field.path;
    input.dataset.builderControl = field.control;
    text.textContent = field.label;
    label.append(input, text);

    return label;
}

function create_border_part(schema, field, part, label_text, control) {
    const
        label = document.createElement("label"),
        text = document.createElement("span"),
        input = control === "select" ? document.createElement("select") : document.createElement("input")
    ;

    label.className = "interactive_builder_field";
    text.textContent = label_text;
    input.className = control === "select" ? "interactive_builder_select" : "interactive_builder_input";
    input.dataset.builderBorder = field.path;
    input.dataset.builderBorderPart = part;
    input.dataset.builderControl = control;

    if (control === "select") {
        for (const option of get_field_options(schema, field)) {
            input.appendChild(create_option(option));
        }
    } else {
        input.type = control;
    }

    label.append(text, input);

    return label;
}

function create_border_field(schema, field) {
    const
        container = document.createElement("div"),
        label = document.createElement("span"),
        parts = document.createElement("div")
    ;

    container.className = "interactive_builder_border_control interactive_builder_field_full";
    container.dataset.builderBorder = field.path;
    label.className = "interactive_builder_border_label";
    label.textContent = field.label;
    parts.className = "interactive_builder_border_parts";
    parts.append(
        create_border_part(schema, field, "width", "Width", "text"),
        create_border_part(schema, field, "style", "Style", "select"),
        create_border_part(schema, field, "color", "Color", "color")
    );
    container.append(label, parts);

    return container;
}

function build_controls(root, schema) {
    const controls_node = root.querySelector("[data-builder-controls]");

    controls_node.replaceChildren();

    for (const group of schema.groups) {
        const
            details = document.createElement("details"),
            summary = document.createElement("summary"),
            grid = document.createElement("div")
        ;

        details.className = "interactive_builder_fieldset";
        details.open = Boolean(group.open);
        summary.className = "interactive_builder_legend";
        summary.textContent = group.label;
        grid.className = "interactive_builder_field_grid";
        details.appendChild(summary);

        if (group.description) {
            const description = document.createElement("p");

            description.className = "interactive_builder_disclaimer";
            description.textContent = group.description;
            details.appendChild(description);
        }

        for (const field of schema.fields.filter((current_field) => current_field.group === group.id)) {
            if (field.control === "border") {
                grid.appendChild(create_border_field(schema, field));
            } else if (field.control === "boolean") {
                grid.appendChild(create_boolean_field(schema, field));
            } else {
                grid.appendChild(create_basic_field(schema, field));
            }
        }

        details.appendChild(grid);
        controls_node.appendChild(details);
    }
}

function build_select(select_node, options, selected_value) {
    select_node.replaceChildren();

    for (const option_definition of options) {
        select_node.appendChild(create_option(option_definition));
    }

    select_node.value = selected_value;
}

function parse_border_value(value) {
    const
        normalized_value = String(value).trim(),
        border_parts = normalized_value.match(/^(\S+)\s+(\S+)\s+(.+)$/)
    ;

    if (!border_parts) {
        return {
            width: normalized_value || "0px",
            style: "solid",
            color: "#000000"
        };
    }

    return {
        width: border_parts[1],
        style: border_parts[2],
        color: border_parts[3]
    };
}

function compose_border_value(parts) {
    return [parts.width, parts.style, parts.color].join(" ");
}

function set_control_value(control, value) {
    if (control.type === "checkbox") {
        control.checked = Boolean(value);
        return;
    }

    if (control.type === "color" && !/^#[0-9a-f]{6}$/i.test(String(value))) {
        control.dataset.builderRawValue = String(value);
        const rgb_parts = String(value).match(/^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i);

        if (rgb_parts) {
            control.value = "#" + rgb_parts.slice(1).map((part) => Math.round(Number(part)).toString(16).padStart(2, "0")).join("");
        }

        return;
    }

    control.value = value ?? "";
    delete control.dataset.builderRawValue;
}

function get_control_value(control) {
    if (control.type === "checkbox") {
        return control.checked;
    }

    if (control.type === "color" && control.dataset.builderRawValue !== undefined) {
        return control.dataset.builderRawValue;
    }

    return control.value;
}

function sync_controls(root, schema, state) {
    for (const field of schema.fields) {
        const value = get_path_value(state, field.path);

        if (field.control === "border") {
            const border_parts = parse_border_value(value);

            for (const control of root.querySelectorAll('[data-builder-border="' + field.path + '"][data-builder-border-part]')) {
                set_control_value(control, border_parts[control.dataset.builderBorderPart]);
            }
        } else {
            const control = root.querySelector('[data-builder-field="' + field.path + '"]');

            set_control_value(control, field.optional && value === null ? "" : value);
        }
    }
}

function read_controls(root, schema, current_state) {
    const state = clone_value(current_state);

    for (const field of schema.fields) {
        let value;

        if (field.control === "border") {
            const parts = parse_border_value(get_path_value(current_state, field.path));

            for (const control of root.querySelectorAll('[data-builder-border="' + field.path + '"][data-builder-border-part]')) {
                parts[control.dataset.builderBorderPart] = get_control_value(control);
            }

            value = compose_border_value(parts);
        } else {
            const control = root.querySelector('[data-builder-field="' + field.path + '"]');

            value = get_control_value(control);

            if (field.optional && (String(value).trim() === "" || String(value).trim() === "null")) {
                value = null;
            }
        }

        set_path_value(state, field.path, value);
    }

    return state;
}

function is_safe_css_value(value, optional = false) {
    if (value === null && optional) {
        return true;
    }

    const normalized_value = String(value).trim();

    return normalized_value !== "" && !/[{};<>]/.test(normalized_value);
}

function validate_controls(root, schema, state) {
    let is_valid = true;

    for (const field of schema.fields) {
        const
            field_value = get_path_value(state, field.path),
            field_is_valid = field.control === "boolean" || is_safe_css_value(field_value, field.optional),
            controls = field.control === "border"
                ? root.querySelectorAll('[data-builder-border="' + field.path + '"][data-builder-border-part]')
                : [root.querySelector('[data-builder-field="' + field.path + '"]')]
        ;

        for (const control of controls) {
            control.setCustomValidity(field_is_valid ? "" : "Introduce un valor CSS válido.");
            control.setAttribute("aria-invalid", String(!field_is_valid));
            control.classList.toggle("is_invalid", !field_is_valid);
        }

        is_valid = is_valid && field_is_valid;
    }

    return is_valid;
}

function normalize_parameter_value(value) {
    if (value === null || value === "") {
        return null;
    }

    return typeof value === "string" ? value.trim() : value;
}

function get_output_key(field, use_aliases) {
    if (!use_aliases || !field.aliases?.length) {
        return field.key;
    }

    if (field.preferred_alias) {
        return field.preferred_alias;
    }

    return [...field.aliases].sort((first, second) => first.length - second.length)[0];
}

function quote_scss_string(value) {
    const normalized_value = String(value).trim();

    if (/^(["']).*\1$/.test(normalized_value)) {
        return normalized_value;
    }

    return '"' + normalized_value.replaceAll('"', '\\"') + '"';
}

function format_parameter_value(field, value) {
    if (value === null) {
        return "null";
    }

    return field.quote ? quote_scss_string(value) : String(value);
}

function format_scss(schema, state, defaults, use_aliases) {
    const
        parameter_blocks = [],
        nested_blocks = new Map()
    ;

    for (const field of schema.fields.filter((current_field) => current_field.output !== false)) {
        const
            value = get_path_value(state, field.path),
            default_value = get_path_value(defaults, field.path)
        ;

        if (normalize_parameter_value(value) === normalize_parameter_value(default_value)) {
            continue;
        }

        const line = get_output_key(field, use_aliases) + ": " + format_parameter_value(field, value);

        if (!field.parent) {
            parameter_blocks.push({ lines: [line] });
            continue;
        }

        if (!nested_blocks.has(field.parent)) {
            const block = { parent: field.parent, lines: [] };

            nested_blocks.set(field.parent, block);
            parameter_blocks.push(block);
        }

        nested_blocks.get(field.parent).lines.push(line);
    }

    if (parameter_blocks.length === 0) {
        return [
            '@use "' + schema.module + '" as *;',
            "",
            schema.selector + " {",
            "    @include " + schema.mixin + ";",
            "}"
        ].join("\n");
    }

    const serialized_blocks = parameter_blocks.map((block) => {
        if (!block.parent) {
            return block.lines;
        }

        return [
            (use_aliases ? schema.parent_aliases?.[block.parent] || block.parent : block.parent) + ": (",
            ...block.lines.map((line, index) => "    " + line + (index < block.lines.length - 1 ? "," : "")),
            ")"
        ];
    });

    const mixin_lines = ["@include " + schema.mixin + "(("];

    for (const [block_index, block] of serialized_blocks.entries()) {
        for (const [line_index, line] of block.entries()) {
            const
                is_last_line = line_index === block.length - 1,
                is_last_block = block_index === serialized_blocks.length - 1
            ;

            mixin_lines.push("    " + line + (is_last_line && !is_last_block ? "," : ""));
        }
    }

    mixin_lines.push("));");

    return [
        '@use "' + schema.module + '" as *;',
        "",
        schema.selector + " {",
        ...mixin_lines.map((line) => "    " + line),
        "}"
    ].join("\n");
}

function set_output(root, output_type, value) {
    const output_node = root.querySelector('[data-builder-output="' + output_type + '"]');

    if (output_node) {
        output_node.textContent = value;
    }
}

function render_builder(root, schema, adapter, state, defaults, preview_state, preview_theme) {
    for (const field of schema.fields) {
        if (!field.css_variable) {
            continue;
        }

        const
            value = get_path_value(state, field.path),
            css_value = adapter.get_css_value?.(field, state, value) ?? value
        ;

        root.style.setProperty(field.css_variable, css_value);
    }

    for (const output of root.querySelectorAll("[data-builder-color-value]")) {
        output.textContent = get_path_value(state, output.dataset.builderColorValue);
    }

    root.querySelector("[data-builder-preview-container]").dataset.previewTheme = preview_theme;
    root.dataset.previewState = preview_state;
    adapter.update_preview(root, state, preview_state);
    set_output(root, "scss", format_scss(schema, state, defaults, root.dataset.builderUseAliases === "true"));
    set_output(root, "html", adapter.format_html(state, preview_state));
}

function copy_text(value) {
    if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(value);
    }

    const textarea = document.createElement("textarea");

    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");

    document.body.removeChild(textarea);

    return copied ? Promise.resolve() : Promise.reject(new Error("Copy failed."));
}

function bind_copy_buttons(root) {
    const feedback = root.querySelector("[data-builder-copy-feedback]");

    for (const button of root.querySelectorAll("[data-builder-copy]")) {
        button.addEventListener("click", async function () {
            const output = root.querySelector('[data-builder-output="' + button.dataset.builderCopy + '"]');

            try {
                await copy_text(output.textContent);
                feedback.textContent = "Copiado";
            } catch {
                feedback.textContent = "No se pudo copiar";
            }

            feedback.classList.add("is_visible");
            window.setTimeout(function () {
                feedback.classList.remove("is_visible");
            }, 1800);
        });
    }
}

function bind_output_tabs(root) {
    const
        tabs = Array.from(root.querySelectorAll("[data-builder-output-tab]")),
        panels = Array.from(root.querySelectorAll("[data-builder-output-panel]"))
    ;

    for (const tab of tabs) {
        tab.addEventListener("click", function () {
            const active_panel = tab.dataset.builderOutputTab;

            for (const current_tab of tabs) {
                const is_active = current_tab === tab;

                current_tab.classList.toggle("is_active", is_active);
                current_tab.setAttribute("aria-selected", String(is_active));
            }

            for (const panel of panels) {
                panel.hidden = panel.dataset.builderOutputPanel !== active_panel;
            }
        });
    }
}

function bind_fullscreen(root) {
    let
        scroll_x = window.scrollX,
        scroll_y = window.scrollY,
        was_fullscreen = false
    ;

    const
        preview_card = root.querySelector(".interactive_builder_preview_card"),
        button = root.querySelector("[data-builder-preview-fullscreen]"),
        update_button = function () {
            const
                is_fullscreen = document.fullscreenElement === preview_card,
                label = is_fullscreen ? "Salir de pantalla completa" : "Ver vista previa en pantalla completa"
            ;

            button.classList.toggle("is_active", is_fullscreen);
            button.setAttribute("aria-label", label);
            button.setAttribute("aria-pressed", String(is_fullscreen));
            button.title = is_fullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa";

            if (was_fullscreen && !is_fullscreen) {
                const restore_position = function () {
                    window.scrollTo({ left: scroll_x, top: scroll_y, behavior: "auto" });
                };

                window.requestAnimationFrame(function () {
                    window.requestAnimationFrame(restore_position);
                });
                window.setTimeout(restore_position, 50);
                window.setTimeout(function () {
                    restore_position();
                    button.focus({ preventScroll: true });
                }, 150);
            }

            was_fullscreen = is_fullscreen;
        }
    ;

    if (!document.fullscreenEnabled || typeof preview_card.requestFullscreen !== "function") {
        button.hidden = true;
        return;
    }

    button.addEventListener("click", async function () {
        try {
            if (document.fullscreenElement === preview_card) {
                await document.exitFullscreen();
            } else {
                scroll_x = window.scrollX;
                scroll_y = window.scrollY;
                await preview_card.requestFullscreen();
            }
        } catch {
            button.title = "No se pudo cambiar el modo de pantalla";
        }
    });

    document.addEventListener("fullscreenchange", update_button);
    update_button();
}

function show_builder_error(root, error) {
    const
        app = root.querySelector("[data-builder-app]"),
        fallback = root.querySelector("[data-builder-fallback]"),
        message = fallback.querySelector("p")
    ;

    app.hidden = true;
    fallback.hidden = false;
    message.textContent = "El constructor interactivo no pudo iniciarse. Puedes consultar el ejemplo estático anterior.";
    console.error("InteractiveBuilder:", error);
}

async function load_schema(schema_url) {
    const response = await fetch(schema_url);

    if (!response.ok) {
        throw new Error("No se pudo cargar el esquema `" + schema_url + "`.");
    }

    return response.json();
}

async function init_builder(root) {
    if (root.dataset.builderInitialized === "true") {
        return;
    }

    root.dataset.builderInitialized = "loading";

    try {
        const
            schema = await load_schema(root.dataset.builderSchema),
            adapter = get_interactive_builder_adapter(schema.adapter),
            schema_errors = validate_builder_schema(schema, Boolean(adapter))
        ;

        if (schema_errors.length > 0) {
            throw new Error(schema_errors.join(" "));
        }

        const
            defaults = get_default_state(schema),
            preset_select = root.querySelector("[data-builder-preset]"),
            preview_state_select = root.querySelector("[data-builder-preview-state]"),
            preview_theme_select = root.querySelector("[data-builder-preview-theme]"),
            aliases_button = root.querySelector("[data-builder-aliases]"),
            reset_button = root.querySelector("[data-builder-reset]"),
            app = root.querySelector("[data-builder-app]"),
            fallback = root.querySelector("[data-builder-fallback]")
        ;

        let current_state = clone_value(defaults);

        build_controls(root, schema);
        build_select(preset_select, schema.presets, "default");
        build_select(preview_state_select, schema.preview.states, schema.preview.default_state);
        build_select(preview_theme_select, schema.preview.backgrounds, schema.preview.default_background);
        adapter.create_preview(root);

        const
            fields = Array.from(root.querySelectorAll("[data-builder-field], [data-builder-border-part]")),
            update_builder = function (event) {
                if (event.currentTarget.type === "color") {
                    delete event.currentTarget.dataset.builderRawValue;
                }

                const next_state = read_controls(root, schema, current_state);

                if (!validate_controls(root, schema, next_state)) {
                    return;
                }

                current_state = next_state;
                preset_select.value = "custom";
                render_builder(
                    root,
                    schema,
                    adapter,
                    current_state,
                    defaults,
                    preview_state_select.value,
                    preview_theme_select.value
                );
            }
        ;

        for (const field of fields) {
            field.addEventListener("input", update_builder);
            field.addEventListener("change", update_builder);
        }

        preset_select.addEventListener("change", function () {
            const preset = schema.presets.find((current_preset) => current_preset.id === preset_select.value);

            if (!preset || preset.custom) {
                return;
            }

            current_state = merge_values(defaults, preset.values);
            sync_controls(root, schema, current_state);
            validate_controls(root, schema, current_state);
            render_builder(
                root,
                schema,
                adapter,
                current_state,
                defaults,
                preview_state_select.value,
                preview_theme_select.value
            );
        });

        reset_button.addEventListener("click", function () {
            current_state = clone_value(defaults);
            preset_select.value = "default";
            preview_state_select.value = schema.preview.default_state;
            sync_controls(root, schema, current_state);
            validate_controls(root, schema, current_state);
            render_builder(
                root,
                schema,
                adapter,
                current_state,
                defaults,
                preview_state_select.value,
                preview_theme_select.value
            );
        });

        preview_state_select.addEventListener("change", function () {
            render_builder(
                root,
                schema,
                adapter,
                current_state,
                defaults,
                preview_state_select.value,
                preview_theme_select.value
            );
        });

        preview_theme_select.addEventListener("change", function () {
            render_builder(
                root,
                schema,
                adapter,
                current_state,
                defaults,
                preview_state_select.value,
                preview_theme_select.value
            );
        });

        aliases_button.addEventListener("click", function () {
            const use_aliases = root.dataset.builderUseAliases !== "true";

            root.dataset.builderUseAliases = String(use_aliases);
            aliases_button.classList.toggle("is_active", use_aliases);
            aliases_button.setAttribute("aria-pressed", String(use_aliases));
            render_builder(
                root,
                schema,
                adapter,
                current_state,
                defaults,
                preview_state_select.value,
                preview_theme_select.value
            );
        });

        bind_copy_buttons(root);
        bind_output_tabs(root);
        bind_fullscreen(root);
        root.dataset.builderUseAliases = "false";
        root.dataset.builderInitialized = "true";
        root.dataset.builderReady = "true";
        fallback.hidden = true;
        app.hidden = false;
        sync_controls(root, schema, current_state);
        validate_controls(root, schema, current_state);
        render_builder(
            root,
            schema,
            adapter,
            current_state,
            defaults,
            preview_state_select.value,
            preview_theme_select.value
        );
    } catch (error) {
        root.dataset.builderInitialized = "error";
        show_builder_error(root, error);
    }
}

export async function init_interactive_builders() {
    await Promise.all(
        Array.from(document.querySelectorAll("[data-interactive-builder]"), (root) => init_builder(root))
    );
}
