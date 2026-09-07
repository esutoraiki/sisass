import { loadPageTemplates } from "./fn.js";
import { clear_active_targets, focus_target, update_page_hash } from "./hash_navigation.js";

const
    selector_main_content = "#main_content",
    selector_search_container = ".page_search",
    selector_search_openclose = "#openclose_search",
    selector_search_input = "#page_search_input",
    selector_search_results = "#page_search_results",
    selector_search_templates_mount = "body",
    search_templates_url = new URL("../../../templates/templates.html", import.meta.url).href,
    search_index_url = new URL("../../json/components/search_index.json", import.meta.url).href,
    documentation_root_url = new URL("../../../", import.meta.url),
    class_active = "active",
    class_hide = "hide",
    mobile_breakpoint = 980,
    initial_results_limit = 5,
    empty_search_message = "Escribe para buscar en toda la documentación.",
    loading_search_message = "Buscando en la documentación...",
    no_results_message = "No se encontraron coincidencias en la documentación.",
    search_error_message = "No se pudo cargar la búsqueda.",
    local_search_message = "Búsqueda limitada a esta página: no se pudo cargar el índice global.",
    template_search_state = "template_page_search_state",
    template_search_item = "template_page_search_item"
;

let documentation_search_data = null;

function open_search_interface() {
    const
        search_node = document.querySelector(selector_search_container),
        openclose_node = document.querySelector(selector_search_openclose),
        container_node = search_node ? search_node.querySelector(".container_search") : null,
        input_node = document.querySelector(selector_search_input)
    ;

    if (!search_node || !container_node) {
        return false;
    }

    if (openclose_node && window.innerWidth <= mobile_breakpoint) {
        openclose_node.classList.add(class_hide);
    }

    search_node.classList.add(class_active);
    container_node.classList.add(class_active);

    if (input_node) {
        input_node.focus();
    }

    return true;
}

function normalize_text(value = "") {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
    ;
}

function get_category_text(section_node) {
    let current_node = section_node;

    while (current_node && current_node.previousElementSibling) {
        current_node = current_node.previousElementSibling;

        if (current_node.classList.contains("category")) {
            return current_node.textContent.replace("Categoría:", "").trim();
        }
    }

    return "";
}

function get_article_title(article_node, section_node) {
    const
        title_node = article_node.querySelector(".group_title .subtitle, .title, .subtitle, h1, h2"),
        title_text = title_node ? title_node.textContent.trim() : "",
        fallback_title = section_node ? section_node.id.replace(/[_-]+/g, " ") : ""
    ;

    return title_text || fallback_title;
}

function get_searchable_text(article_node) {
    const
        article_clone = article_node.cloneNode(true),
        removable_nodes = article_clone.querySelectorAll("pre, .result, script, style")
    ;

    for (const removable_node of removable_nodes) {
        removable_node.remove();
    }

    return article_clone.textContent.replace(/\s+/g, " ").trim();
}

function get_display_title(title) {
    const source_match = title.match(/^(.+?)\s+\((_[^)]+\.(?:sass|scss|scscs|css|js|html))\)$/i);

    return source_match ? source_match[1] : title;
}

function get_source_file(title) {
    const source_match = title.match(/^(.+?)\s+\((_[^)]+\.(?:sass|scss|scscs|css|js|html))\)$/i);

    return source_match ? source_match[2] : "";
}

function get_result_icon(item) {
    const category = normalize_text(item.category);

    if (category === "mixin" || category === "function") {
        return "sisass_isotipo";
    }

    if (item.icon) {
        return item.icon;
    }

    if (category === "articulo") {
        return "file";
    }

    return "file";
}

function prepare_index_item(item) {
    const
        display_title = item.display_title || get_display_title(item.title),
        source_file = item.source_file || get_source_file(item.title),
        category = item.category || "Documentación",
        page_title = item.page_title || "Documentación",
        display_path = item.display_path || item.url || page_title
    ;

    return {
        ...item,
        display_title,
        source_file,
        category,
        page_title,
        display_path,
        icon: get_result_icon({ ...item, category, source_file }),
        normalized_title: normalize_text(display_title),
        normalized_category: normalize_text(category),
        normalized_text: normalize_text(item.text)
    };
}

function build_page_index(root_node) {
    const
        section_nodes = root_node.querySelectorAll("section"),
        index = []
    ;

    for (const section_node of section_nodes) {
        const article_node = section_node.querySelector("article");

        if (!article_node) {
            continue;
        }

        const
            title = get_article_title(article_node, section_node),
            category = get_category_text(section_node),
            text = get_searchable_text(article_node),
            anchor = section_node.id || article_node.id
        ;

        if (anchor === "") {
            continue;
        }

        index.push(prepare_index_item({
            anchor,
            title,
            category,
            page_title: "Página actual",
            display_path: window.location.pathname,
            text
        }));
    }

    return index;
}

async function get_documentation_search_data() {
    if (documentation_search_data !== null) {
        return documentation_search_data;
    }

    try {
        const response = await fetch(search_index_url);

        if (!response.ok) {
            throw new Error("Search index request failed with status " + response.status + ".");
        }

        const
            data = await response.json(),
            items = Array.isArray(data.items) ? data.items : []
        ;

        documentation_search_data = {
            items: items.filter(function (item) {
                return (
                    typeof item.url === "string" &&
                    typeof item.anchor === "string" &&
                    typeof item.title === "string" &&
                    typeof item.text === "string"
                );
            }).map(prepare_index_item),
            is_global: true
        };
    } catch (error) {
        console.warn("No se pudo cargar el índice global de búsqueda.", error);
        documentation_search_data = {
            items: [],
            is_global: false
        };
    }

    return documentation_search_data;
}

function get_result_url(item) {
    const result_url = new URL(item.url || window.location.pathname, documentation_root_url);

    result_url.hash = item.anchor;
    return result_url;
}

function get_normalized_mapping(value) {
    const
        normalized_characters = [],
        original_indexes = []
    ;

    let previous_was_space = false;

    for (let index = 0; index < value.length; index += 1) {
        const
            original_character = value[index],
            is_space = /\s/.test(original_character),
            normalized_character = original_character
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
        ;

        if (is_space) {
            if (!previous_was_space && normalized_characters.length > 0) {
                normalized_characters.push(" ");
                original_indexes.push(index);
            }
            previous_was_space = true;
            continue;
        }

        previous_was_space = false;

        for (const character of normalized_character) {
            normalized_characters.push(character);
            original_indexes.push(index);
        }
    }

    if (normalized_characters.at(-1) === " ") {
        normalized_characters.pop();
        original_indexes.pop();
    }

    return {
        normalized: normalized_characters.join(""),
        original_indexes
    };
}

function get_match_ranges(value, query) {
    const
        words = normalize_text(query).split(" ").filter(Boolean),
        mapping = get_normalized_mapping(value),
        ranges = []
    ;

    for (const word of words) {
        let match_index = mapping.normalized.indexOf(word);

        while (match_index !== -1) {
            const
                start = mapping.original_indexes[match_index],
                final_normalized_index = match_index + word.length - 1,
                end = mapping.original_indexes[final_normalized_index] + 1
            ;

            ranges.push({ start, end });
            match_index = mapping.normalized.indexOf(word, match_index + word.length);
        }
    }

    return ranges.sort((left_range, right_range) => left_range.start - right_range.start)
        .reduce(function (merged_ranges, range) {
            const previous_range = merged_ranges.at(-1);

            if (previous_range && range.start <= previous_range.end) {
                previous_range.end = Math.max(previous_range.end, range.end);
                return merged_ranges;
            }

            merged_ranges.push({ ...range });
            return merged_ranges;
        }, [])
    ;
}

function append_highlighted_text(node, value, query) {
    const ranges = get_match_ranges(value, query);

    node.textContent = "";

    if (ranges.length === 0) {
        node.textContent = value;
        return;
    }

    let cursor = 0;

    for (const range of ranges) {
        if (range.start > cursor) {
            node.appendChild(document.createTextNode(value.slice(cursor, range.start)));
        }

        const mark_node = document.createElement("mark");

        mark_node.textContent = value.slice(range.start, range.end);
        node.appendChild(mark_node);
        cursor = range.end;
    }

    if (cursor < value.length) {
        node.appendChild(document.createTextNode(value.slice(cursor)));
    }
}

function get_result_snippet(item, query) {
    const
        summary = item.summary || "",
        text = normalize_text(summary).includes(normalize_text(query)) ? summary : item.text,
        match_ranges = get_match_ranges(text, query),
        first_range = match_ranges[0]
    ;

    if (text.length <= 150) {
        return text;
    }

    if (first_range) {
        const
            start = Math.max(0, first_range.start - 38),
            end = Math.min(text.length, start + 150),
            prefix = start > 0 ? "..." : "",
            suffix = end < text.length ? "..." : ""
        ;

        return prefix + text.slice(start, end).trim() + suffix;
    }

    return text.slice(0, 150).trim() + "...";
}

function get_search_results(index, query) {
    const
        words = normalize_text(query).split(" ").filter(Boolean),
        results = []
    ;

    if (words.length === 0) {
        return results;
    }

    for (const item of index) {
        let
            score = 0,
            valid = true
        ;

        for (const word of words) {
            const
                title_match = item.normalized_title.includes(word),
                category_match = item.normalized_category.includes(word),
                text_match = item.normalized_text.includes(word)
            ;

            if (!title_match && !category_match && !text_match) {
                valid = false;
                break;
            }

            if (item.normalized_title.startsWith(word)) {
                score += 120;
            } else if (title_match) {
                score += 80;
            }

            if (category_match) {
                score += 30;
            }

            if (text_match) {
                score += 10;
            }
        }

        if (valid) {
            results.push({
                ...item,
                score
            });
        }
    }

    return results.sort((left_item, right_item) => right_item.score - left_item.score);
}

function get_visible_results(state) {
    return state.show_all ? state.results : state.results.slice(0, initial_results_limit);
}

function get_result_count_label(total) {
    return total + (total === 1 ? " resultado" : " resultados");
}

function get_category_label(category) {
    return normalize_text(category) === "function" ? "Función" : category;
}

function render_empty_state(list_node, message) {
    const template_node = document.getElementById(template_search_state);

    list_node.innerHTML = "";

    if (!(template_node instanceof HTMLTemplateElement)) {
        const fallback_node = document.createElement("p");

        fallback_node.className = "page_search_state";
        fallback_node.textContent = message;
        list_node.appendChild(fallback_node);
        return;
    }

    const state_node = template_node.content.firstElementChild.cloneNode(true);

    state_node.textContent = message;
    list_node.appendChild(state_node);
}

function set_panel_visibility(nodes, state, is_visible) {
    state.is_open = is_visible;
    nodes.results_node.hidden = !is_visible;
    nodes.results_node.classList.toggle("is_visible", is_visible);
    nodes.input_node.setAttribute("aria-expanded", String(is_visible));

    if (!is_visible) {
        nodes.input_node.removeAttribute("aria-activedescendant");
    }
}

function update_active_result(nodes, state, next_index, should_scroll = false) {
    const result_nodes = [...nodes.list_node.querySelectorAll(".page_search_item")];

    if (result_nodes.length === 0) {
        state.active_index = -1;
        nodes.input_node.removeAttribute("aria-activedescendant");
        return;
    }

    state.active_index = Math.max(0, Math.min(next_index, result_nodes.length - 1));

    for (let index = 0; index < result_nodes.length; index += 1) {
        const
            result_node = result_nodes[index],
            is_active = index === state.active_index
        ;

        result_node.classList.toggle("is_active", is_active);
        result_node.setAttribute("aria-selected", String(is_active));
    }

    const active_node = result_nodes[state.active_index];

    nodes.input_node.setAttribute("aria-activedescendant", active_node.id);

    if (should_scroll) {
        active_node.scrollIntoView({ block: "nearest" });
    }
}

function render_result_item(item, index, query, nodes, state, root_node) {
    const
        template_node = document.getElementById(template_search_item),
        result_node = template_node.content.firstElementChild.cloneNode(true),
        icon_node = result_node.querySelector(".page_search_icon"),
        title_node = result_node.querySelector(".page_search_title"),
        source_node = result_node.querySelector(".page_search_source"),
        category_node = result_node.querySelector(".page_search_category"),
        excerpt_node = result_node.querySelector(".page_search_excerpt"),
        path_node = result_node.querySelector(".page_search_path"),
        result_url = get_result_url(item),
        snippet = get_result_snippet(item, query)
    ;

    result_node.id = "page_search_result_" + index;
    result_node.href = result_url.href;
    result_node.dataset.searchAnchor = item.anchor;

    if (icon_node) {
        icon_node.dataset.searchIcon = item.icon;
    }

    if (title_node) {
        append_highlighted_text(title_node, item.display_title, query);
    }

    if (source_node) {
        if (item.source_file) {
            source_node.textContent = "(" + item.source_file + ")";
        } else {
            source_node.remove();
        }
    }

    if (category_node) {
        category_node.textContent = get_category_label(item.category);
        category_node.dataset.searchCategory = normalize_text(item.category).replace(/\s+/g, "_");
    }

    if (excerpt_node) {
        append_highlighted_text(excerpt_node, snippet, query);
    }

    if (path_node) {
        path_node.textContent = item.display_path;
    }

    result_node.addEventListener("pointerenter", function () {
        update_active_result(nodes, state, index);
    });

    result_node.addEventListener("click", function (event) {
        const current_url = new URL(event.currentTarget.href);

        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            current_url.pathname !== window.location.pathname
        ) {
            return;
        }

        event.preventDefault();
        update_page_hash(event.currentTarget.dataset.searchAnchor);
        focus_target(root_node, event.currentTarget.dataset.searchAnchor);
        set_panel_visibility(nodes, state, false);
    });

    return result_node;
}

function render_results(nodes, state, root_node) {
    const
        total = state.results.length,
        visible_results = get_visible_results(state),
        query_label = "“" + state.query + "”",
        show_all_available = total > initial_results_limit && !state.show_all
    ;

    nodes.title_node.textContent = "Resultados para " + query_label;
    nodes.count_node.textContent = get_result_count_label(total);
    nodes.count_node.hidden = false;
    nodes.list_node.innerHTML = "";
    nodes.list_node.scrollTop = 0;

    if (total === 0) {
        render_empty_state(
            nodes.list_node,
            state.has_search_index ? no_results_message : search_error_message
        );
    } else {
        const template_node = document.getElementById(template_search_item);

        if (template_node instanceof HTMLTemplateElement) {
            for (let index = 0; index < visible_results.length; index += 1) {
                nodes.list_node.appendChild(render_result_item(
                    visible_results[index],
                    index,
                    state.query,
                    nodes,
                    state,
                    root_node
                ));
            }
        }
    }

    nodes.footer_node.hidden = total <= initial_results_limit;
    nodes.results_node.classList.toggle("has_many_results", total > initial_results_limit);
    nodes.show_all_node.hidden = !show_all_available;
    nodes.all_results_node.hidden = !state.show_all;
    nodes.show_all_label_node.textContent = "Ver todos los resultados para " + query_label;
    if (!state.has_search_index) {
        nodes.status_node.textContent = search_error_message;
    } else if (state.is_global) {
        nodes.status_node.textContent = get_result_count_label(total) + " para " + state.query + ".";
    } else {
        nodes.status_node.textContent = local_search_message + " " + get_result_count_label(total) + ".";
    }

    set_panel_visibility(nodes, state, true);
    update_active_result(nodes, state, total > 0 ? 0 : -1);
}

function render_loading_state(nodes, state) {
    nodes.title_node.textContent = "Resultados para “" + state.query + "”";
    nodes.count_node.hidden = true;
    nodes.footer_node.hidden = true;
    nodes.results_node.classList.remove("has_many_results");
    render_empty_state(nodes.list_node, loading_search_message);
    nodes.status_node.textContent = loading_search_message;
    set_panel_visibility(nodes, state, true);
    update_active_result(nodes, state, -1);
}

function close_results(nodes, state) {
    set_panel_visibility(nodes, state, false);
}

function update_search(nodes, state, root_node) {
    const query = nodes.input_node.value.trim();

    state.query = query;
    state.show_all = false;
    nodes.clear_node.hidden = query === "";

    if (query === "") {
        state.results = [];
        state.active_index = -1;
        close_results(nodes, state);
        nodes.status_node.textContent = empty_search_message;
        clear_active_targets(root_node);
        return;
    }

    if (state.is_loading) {
        state.results = [];
        render_loading_state(nodes, state);
        return;
    }

    state.results = get_search_results(state.index, query);
    render_results(nodes, state, root_node);
}

function show_all_results(nodes, state, root_node) {
    if (state.show_all || state.results.length <= initial_results_limit) {
        return;
    }

    state.show_all = true;
    render_results(nodes, state, root_node);
    nodes.status_node.textContent = "Mostrando " + get_result_count_label(state.results.length) + ".";
    nodes.input_node.focus();
}

function open_active_result(nodes, state) {
    const
        result_nodes = nodes.list_node.querySelectorAll(".page_search_item"),
        active_node = result_nodes[state.active_index]
    ;

    if (active_node) {
        active_node.click();
    }
}

function attach_keyboard_shortcuts(root_node, nodes, state) {
    document.addEventListener("keydown", function (event) {
        const
            target = event.target,
            is_editable = target instanceof HTMLElement && (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ),
            is_search_target = target instanceof HTMLElement && Boolean(target.closest(selector_search_container))
        ;

        if (
            (event.key === "/" || (
                event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)
            )) &&
            !is_editable
        ) {
            event.preventDefault();
            open_search_interface();
            nodes.input_node.focus();
            nodes.input_node.select();
            return;
        }

        if (!is_search_target) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            close_results(nodes, state);
            nodes.input_node.focus();
            return;
        }

        if (target !== nodes.input_node) {
            return;
        }

        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            show_all_results(nodes, state, root_node);
            return;
        }

        if (!state.is_open) {
            return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            const
                direction = event.key === "ArrowDown" ? 1 : -1,
                next_index = state.active_index + direction
            ;

            event.preventDefault();
            update_active_result(nodes, state, next_index, true);
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            open_active_result(nodes, state);
        }
    });
}

function initialize_search_interface(root_node) {
    const
        search_node = document.querySelector(selector_search_container),
        openclose_node = document.querySelector(selector_search_openclose),
        container_node = search_node ? search_node.querySelector(".container_search") : null,
        input_node = document.querySelector(selector_search_input),
        results_node = document.querySelector(selector_search_results),
        clear_node = document.querySelector("#page_search_clear"),
        list_node = document.querySelector("#page_search_list"),
        title_node = document.querySelector("#page_search_results_title"),
        count_node = results_node ? results_node.querySelector(".page_search_results_count") : null,
        footer_node = results_node ? results_node.querySelector(".page_search_results_footer") : null,
        show_all_node = results_node ? results_node.querySelector(".page_search_show_all") : null,
        show_all_label_node = results_node ? results_node.querySelector(".page_search_show_all_label") : null,
        show_all_shortcut_node = results_node ? results_node.querySelector(".page_search_show_all_shortcut") : null,
        all_results_node = results_node ? results_node.querySelector(".page_search_all_results") : null,
        status_node = document.querySelector("#page_search_status")
    ;

    if (
        !root_node || !search_node || !container_node || !input_node || !results_node ||
        !clear_node || !list_node || !title_node || !count_node || !footer_node ||
        !show_all_node || !show_all_label_node || !show_all_shortcut_node ||
        !all_results_node || !status_node
    ) {
        return false;
    }

    if (root_node.dataset.searchReady === "true") {
        return {
            apply_search_data: function () {}
        };
    }

    const
        local_index = build_page_index(root_node),
        nodes = {
            search_node,
            container_node,
            input_node,
            results_node,
            clear_node,
            list_node,
            title_node,
            count_node,
            footer_node,
            show_all_node,
            show_all_label_node,
            show_all_shortcut_node,
            all_results_node,
            status_node
        },
        state = {
            index: local_index,
            is_global: false,
            has_search_index: local_index.length > 0,
            is_loading: true,
            query: "",
            results: [],
            active_index: -1,
            show_all: false,
            is_open: false
        },
        is_macos = /Mac|iPhone|iPad/.test(navigator.platform)
    ;

    root_node.dataset.searchReady = "true";
    nodes.show_all_shortcut_node.textContent = is_macos ? "⌘ ↵" : "Ctrl ↵";

    const header_shortcut_node = search_node.querySelector(".page_search_shortcut");

    if (header_shortcut_node) {
        header_shortcut_node.textContent = is_macos ? "⌘ K" : "Ctrl K";
    }

    nodes.status_node.textContent = empty_search_message;

    if (openclose_node) {
        openclose_node.addEventListener("click", function (event) {
            event.preventDefault();
            open_search_interface();
        });
    }

    input_node.addEventListener("input", function () {
        update_search(nodes, state, root_node);
    });

    input_node.addEventListener("focus", function () {
        if (state.query !== "") {
            render_results(nodes, state, root_node);
        }
    });

    clear_node.addEventListener("click", function () {
        input_node.value = "";
        update_search(nodes, state, root_node);
        input_node.focus();
    });

    show_all_node.addEventListener("click", function () {
        show_all_results(nodes, state, root_node);
    });

    document.addEventListener("click", function (event) {
        const target = event.target;

        if (target instanceof HTMLElement && !target.closest(selector_search_container)) {
            close_results(nodes, state);
        }
    });

    attach_keyboard_shortcuts(root_node, nodes, state);

    return {
        apply_search_data: function (search_data) {
            const has_global_index = search_data.is_global && search_data.items.length > 0;

            state.index = has_global_index ? search_data.items : local_index;
            state.is_global = has_global_index;
            state.has_search_index = state.index.length > 0;
            state.is_loading = false;

            if (state.query !== "" && state.is_open) {
                update_search(nodes, state, root_node);
                return;
            }

            if (!state.has_search_index) {
                nodes.status_node.textContent = search_error_message;
            } else if (!state.is_global) {
                nodes.status_node.textContent = local_search_message;
            } else {
                nodes.status_node.textContent = empty_search_message;
            }
        }
    };
}

async function init_documentation_search(attr = {}) {
    const
        root_selector = attr.root_selector || selector_main_content,
        attempts_limit = attr.attempts_limit || 120,
        current_page = attr.current_page || "documentationpage",
        templates_insert = document.querySelector(attr.templates_insert || selector_search_templates_mount)
    ;

    let attempt = 0;

    await loadPageTemplates({
        url: attr.templates_url || search_templates_url,
        current_page,
        insert: templates_insert,
        position: "beforeend",
        template_ids: [
            template_search_state,
            template_search_item
        ]
    });

    const search_data_promise = get_documentation_search_data();

    const search_controller = await new Promise((resolve) => {
        const wait_for_nodes = function () {
            const root_node = document.querySelector(root_selector);
            const controller = initialize_search_interface(root_node);

            if (controller) {
                resolve(controller);
                return;
            }

            attempt += 1;

            if (attempt < attempts_limit) {
                window.requestAnimationFrame(wait_for_nodes);
                return;
            }

            resolve(null);
        };

        wait_for_nodes();
    });

    if (!search_controller) {
        return false;
    }

    search_data_promise.then(function (search_data) {
        search_controller.apply_search_data(search_data);
    });

    return true;
}

export { init_documentation_search };
