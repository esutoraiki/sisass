import { loadPageTemplates } from "./fn.js";
import { clear_active_targets, focus_target, update_page_hash } from "./hash_navigation.js";

const
    selector_main_content = "#main_content",
    selector_search_input = "#page_search_input",
    selector_search_results = "#page_search_results",
    selector_search_templates_mount = "body",
    search_templates_url = new URL("../../../templates/templates.html", import.meta.url).href,
    max_results = 12,
    empty_search_message = "Escribe para buscar en la página actual.",
    no_results_message = "No se encontraron coincidencias en esta página.",
    template_search_state = "template_page_search_state",
    template_search_item = "template_page_search_item"
;

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

function build_page_index(root_node) {
    const
        section_nodes = root_node.querySelectorAll("section"),
        index = []
    ;

    for (const section_node of section_nodes) {
        const
            article_node = section_node.querySelector("article")
        ;

        if (!article_node) {
            continue;
        }

        const
            title = get_article_title(article_node, section_node),
            category = get_category_text(section_node),
            text = get_searchable_text(article_node),
            anchor = section_node.id || article_node.id,
            normalized_title = normalize_text(title),
            normalized_category = normalize_text(category),
            normalized_text = normalize_text(text)
        ;

        if (anchor === "") {
            continue;
        }

        index.push({
            anchor,
            title,
            category,
            text,
            normalized_title,
            normalized_category,
            normalized_text
        });
    }

    return index;
}

function get_result_snippet(item, query) {
    const
        words = query.split(" ").filter(Boolean),
        text = item.text
    ;

    if (text.length <= 170) {
        return text;
    }

    for (const word of words) {
        const
            match_index = normalize_text(text).indexOf(word)
        ;

        if (match_index !== -1) {
            const
                start = Math.max(0, match_index - 45),
                end = Math.min(text.length, start + 170),
                prefix = start > 0 ? "..." : "",
                suffix = end < text.length ? "..." : ""
            ;

            return prefix + text.slice(start, end).trim() + suffix;
        }
    }

    return text.slice(0, 170).trim() + "...";
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

    return results
        .sort((left_item, right_item) => right_item.score - left_item.score)
        .slice(0, max_results)
    ;
}

function render_empty_state(results_node, message) {
    const
        template_node = document.getElementById(template_search_state)
    ;

    results_node.innerHTML = "";

    if (!(template_node instanceof HTMLTemplateElement)) {
        const
            fallback_node = document.createElement("p")
        ;

        fallback_node.className = "page_search_state";
        fallback_node.textContent = message;
        results_node.appendChild(fallback_node);
        return;
    }

    const
        state_node = template_node.content.firstElementChild.cloneNode(true)
    ;

    state_node.textContent = message;
    results_node.appendChild(state_node);
}

function render_results(results_node, results, root_node) {
    if (results.length === 0) {
        render_empty_state(results_node, no_results_message);
        results_node.classList.add("is_visible");
        return;
    }

    const
        template_node = document.getElementById(template_search_item)
    ;

    results_node.innerHTML = "";

    if (!(template_node instanceof HTMLTemplateElement)) {
        return;
    }

    for (const item of results) {
        const
            result_node = template_node.content.firstElementChild.cloneNode(true),
            title_node = result_node.querySelector(".page_search_title"),
            category_node = result_node.querySelector(".page_search_category"),
            excerpt_node = result_node.querySelector(".page_search_excerpt")
        ;

        result_node.href = "#" + item.anchor;
        result_node.dataset.searchAnchor = item.anchor;

        if (title_node) {
            title_node.textContent = item.title;
        }

        if (category_node) {
            if (item.category !== "") {
                category_node.textContent = item.category;
            } else {
                category_node.remove();
            }
        }

        if (excerpt_node) {
            excerpt_node.textContent = get_result_snippet(item, normalize_text(results_node.dataset.query || ""));
        }

        results_node.appendChild(result_node);
    }
    results_node.classList.add("is_visible");

    const
        link_nodes = results_node.querySelectorAll("[data-search-anchor]")
    ;

    for (const link_node of link_nodes) {
        link_node.addEventListener("click", function (event) {
            const
                anchor = event.currentTarget.dataset.searchAnchor
            ;

            event.preventDefault();
            update_page_hash(anchor);
            focus_target(root_node, anchor);
            results_node.classList.remove("is_visible");
        });
    }
}

function attach_keyboard_shortcuts(root_node, input_node, results_node) {
    document.addEventListener("keydown", function (event) {
        const
            target = event.target,
            is_editable = target instanceof HTMLElement && (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            )
        ;

        if (event.key === "/" && !is_editable) {
            event.preventDefault();
            input_node.focus();
            input_node.select();
        }

        if (event.key === "Escape" && document.activeElement === input_node) {
            input_node.value = "";
            results_node.classList.remove("is_visible");
            render_empty_state(results_node, empty_search_message);
            clear_active_targets(root_node);
            input_node.blur();
        }
    });
}

function initialize_search_interface(root_node) {
    const
        input_node = document.querySelector(selector_search_input),
        results_node = document.querySelector(selector_search_results)
    ;

    if (!root_node || !input_node || !results_node) {
        return false;
    }

    if (root_node.dataset.searchReady === "true") {
        return true;
    }

    const
        page_index = build_page_index(root_node)
    ;

    root_node.dataset.searchReady = "true";
    render_empty_state(results_node, empty_search_message);

    input_node.addEventListener("input", function () {
        const
            query = input_node.value.trim()
        ;

        results_node.dataset.query = query;

        if (query === "") {
            results_node.classList.remove("is_visible");
            render_empty_state(results_node, empty_search_message);
            clear_active_targets(root_node);
            return;
        }

        render_results(results_node, get_search_results(page_index, query), root_node);
    });

    document.addEventListener("click", function (event) {
        const
            target = event.target
        ;

        if (
            target instanceof HTMLElement &&
            !target.closest(".page_search")
        ) {
            results_node.classList.remove("is_visible");
        }
    });

    attach_keyboard_shortcuts(root_node, input_node, results_node);

    return true;
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
        current_page: current_page,
        insert: templates_insert,
        position: "beforeend",
        template_ids: [
            template_search_state,
            template_search_item
        ]
    });

    return await new Promise((resolve) => {
        const wait_for_nodes = function () {
            const
                root_node = document.querySelector(root_selector)
            ;

            if (initialize_search_interface(root_node)) {
                resolve(true);
                return;
            }

            attempt += 1;

            if (attempt < attempts_limit) {
                window.requestAnimationFrame(wait_for_nodes);
                return;
            }

            resolve(false);
        };

        wait_for_nodes();
    });
}

export { init_documentation_search };
