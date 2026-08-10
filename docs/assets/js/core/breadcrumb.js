const
    selector_main_content = "#main_content",
    class_breadcrumb = "page_breadcrumb"
;

function get_clean_path_parts(pathname) {
    const
        docs_marker = "/docs/",
        decoded_path = decodeURIComponent(pathname),
        docs_index = decoded_path.indexOf(docs_marker)
    ;

    let
        relative_path = docs_index === -1 ? decoded_path : decoded_path.slice(docs_index + docs_marker.length)
    ;

    relative_path = relative_path
        .replace(/^\/+/, "")
        .replace(/^pages\//, "")
    ;

    if (relative_path === "" || relative_path === "index.html") {
        return [];
    }

    return relative_path.split("/").filter(Boolean);
}

function normalize_breadcrumb_item(item) {
    if (typeof item === "string") {
        return {
            label: item,
            url: ""
        };
    }

    if (!item || typeof item.label !== "string") {
        return null;
    }

    return {
        label: item.label,
        url: typeof item.url === "string" ? item.url : ""
    };
}

function get_manual_breadcrumb(data) {
    if (!Array.isArray(data.breadcrumb)) {
        return [];
    }

    return data.breadcrumb
        .map(normalize_breadcrumb_item)
        .filter(Boolean)
    ;
}

function get_auto_breadcrumb() {
    return get_clean_path_parts(window.location.pathname).map(function (path_part) {
        return {
            label: path_part,
            url: ""
        };
    });
}

async function get_page_breadcrumb_items(json_url) {
    if (json_url) {
        try {
            const
                response = await fetch(json_url),
                data = await response.json(),
                manual_items = get_manual_breadcrumb(data)
            ;

            if (manual_items.length > 0) {
                return manual_items;
            }
        } catch (error) {
            console.warn("No se pudo cargar la configuración del breadcrumb.", error);
        }
    }

    return get_auto_breadcrumb();
}

function create_breadcrumb_item(item, is_current) {
    const
        item_node = document.createElement("li"),
        text_node = item.url && !is_current ? document.createElement("a") : document.createElement("span")
    ;

    item_node.className = "page_breadcrumb_item";
    text_node.className = "page_breadcrumb_text";
    text_node.textContent = item.label;

    if (text_node instanceof HTMLAnchorElement) {
        text_node.href = item.url;
    } else if (is_current) {
        text_node.setAttribute("aria-current", "page");
    }

    item_node.appendChild(text_node);

    return item_node;
}

function render_page_breadcrumb(root_node, items) {
    const
        previous_node = root_node.querySelector("." + class_breadcrumb),
        breadcrumb_node = document.createElement("nav"),
        list_node = document.createElement("ol")
    ;

    if (previous_node) {
        previous_node.remove();
    }

    if (items.length === 0) {
        return null;
    }

    breadcrumb_node.className = class_breadcrumb;
    breadcrumb_node.setAttribute("aria-label", "Ruta de navegación");
    list_node.className = "page_breadcrumb_list";

    items.forEach(function (item, index) {
        list_node.appendChild(create_breadcrumb_item(item, index === items.length - 1));
    });

    breadcrumb_node.appendChild(list_node);
    root_node.insertAdjacentElement("afterbegin", breadcrumb_node);

    return breadcrumb_node;
}

async function init_page_breadcrumb(attr = {}) {
    const
        root_selector = attr.root_selector || selector_main_content,
        json_url = attr.json_url || "",
        root_node = document.querySelector(root_selector)
    ;

    if (!root_node) {
        return null;
    }

    const
        items = await get_page_breadcrumb_items(json_url)
    ;

    return render_page_breadcrumb(root_node, items);
}

export { init_page_breadcrumb };
