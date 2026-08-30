const
    default_root_selector = "#main_content",
    default_menu_selector = "#sidebar_menu",
    default_heading_selector = "h2[data-page-menu-item], h3[data-page-menu-item]",
    default_panel_selector = "[data-tab-panel-panel]",
    default_mobile_query = "(max-width: 980px)",
    default_active_offset = 120,
    menu_instances = new WeakMap()
;

function normalize_text(value = "") {
    return String(value).replace(/\s+/g, " ").trim();
}

function get_document_id_counts() {
    const id_counts = new Map();

    for (const node of document.querySelectorAll("[id]")) {
        const node_id = normalize_text(node.id);

        if (node_id !== "") {
            id_counts.set(node_id, (id_counts.get(node_id) || 0) + 1);
        }
    }

    return id_counts;
}

function get_heading_label(heading_node) {
    return normalize_text(heading_node.dataset.pageMenuLabel) || normalize_text(heading_node.textContent);
}

function collect_page_menu_sections(root_node, attr = {}) {
    const
        heading_selector = attr.heading_selector || default_heading_selector,
        panel_selector = attr.panel_selector || default_panel_selector,
        heading_nodes = Array.from(root_node.querySelectorAll(heading_selector))
            .filter((heading_node) => !heading_node.closest(panel_selector)),
        id_counts = get_document_id_counts(),
        warned_ids = new Set(),
        sections = []
    ;

    let current_section = null;

    for (const heading_node of heading_nodes) {
        const
            heading_id = normalize_text(heading_node.id),
            heading_level = Number(heading_node.tagName.slice(1)),
            heading_label = get_heading_label(heading_node)
        ;

        if (heading_id === "") {
            console.warn("PageMenu: a marked heading is missing an id.", heading_node);
            continue;
        }

        if ((id_counts.get(heading_id) || 0) > 1) {
            if (!warned_ids.has(heading_id)) {
                console.warn("PageMenu: duplicate heading id `" + heading_id + "` was omitted.");
                warned_ids.add(heading_id);
            }
            continue;
        }

        if (heading_label === "") {
            console.warn("PageMenu: heading `" + heading_id + "` has no usable label.");
            continue;
        }

        const heading_entry = {
            id: heading_id,
            label: heading_label,
            level: heading_level,
            node: heading_node,
            children: []
        };

        if (heading_level === 2) {
            current_section = heading_entry;
            sections.push(current_section);
            continue;
        }

        if (!current_section) {
            console.warn("PageMenu: h3 `" + heading_id + "` has no preceding valid h2.");
            continue;
        }

        current_section.children.push(heading_entry);
    }

    return sections;
}

function create_page_menu_item(heading_entry, entry_map, parent_item = null) {
    const
        item_node = document.createElement("li"),
        link_node = document.createElement("a")
    ;

    item_node.className = "page_menu_item page_menu_item_level_" + heading_entry.level;
    link_node.className = "page_menu_link";
    link_node.href = window.location.pathname + window.location.search + "#" + heading_entry.id;
    link_node.textContent = heading_entry.label;
    item_node.appendChild(link_node);

    entry_map.set(heading_entry.node, {
        heading: heading_entry,
        item_node: item_node,
        link_node: link_node,
        parent_item: parent_item
    });

    if (heading_entry.children.length > 0) {
        const sublist_node = document.createElement("ol");

        sublist_node.className = "page_menu_sublist";

        for (const child_entry of heading_entry.children) {
            sublist_node.appendChild(create_page_menu_item(child_entry, entry_map, item_node));
        }

        item_node.appendChild(sublist_node);
    }

    return item_node;
}

function render_page_menu(menu_root, sections, attr = {}) {
    const
        menu_label = normalize_text(attr.label) || "En esta página",
        menu_id = normalize_text(menu_root.id) || "page_menu",
        content_id = menu_id + "_content",
        nav_node = document.createElement("nav"),
        desktop_title_node = document.createElement("p"),
        toggle_node = document.createElement("button"),
        toggle_label_node = document.createElement("span"),
        toggle_icon_node = document.createElement("span"),
        content_node = document.createElement("div"),
        list_node = document.createElement("ol"),
        entry_map = new Map()
    ;

    nav_node.className = "page_menu";
    nav_node.setAttribute("aria-label", menu_label);

    desktop_title_node.className = "page_menu_title";
    desktop_title_node.textContent = menu_label;

    toggle_node.className = "page_menu_toggle";
    toggle_node.type = "button";
    toggle_node.setAttribute("aria-controls", content_id);
    toggle_node.setAttribute("aria-expanded", "false");

    toggle_label_node.className = "page_menu_toggle_label";
    toggle_label_node.textContent = menu_label;
    toggle_icon_node.className = "page_menu_toggle_icon";
    toggle_icon_node.setAttribute("aria-hidden", "true");
    toggle_node.append(toggle_label_node, toggle_icon_node);

    content_node.id = content_id;
    content_node.className = "page_menu_content";
    list_node.className = "page_menu_list";

    for (const section_entry of sections) {
        list_node.appendChild(create_page_menu_item(section_entry, entry_map));
    }

    content_node.appendChild(list_node);
    nav_node.append(desktop_title_node, toggle_node, content_node);
    menu_root.replaceChildren(nav_node);
    menu_root.hidden = false;

    return {
        content_node: content_node,
        desktop_title_node: desktop_title_node,
        entry_map: entry_map,
        nav_node: nav_node,
        toggle_node: toggle_node
    };
}

function init_page_menu(attr = {}) {
    const
        root_selector = attr.root_selector || default_root_selector,
        menu_selector = attr.menu_selector || default_menu_selector,
        root_node = document.querySelector(root_selector),
        menu_root = document.querySelector(menu_selector)
    ;

    if (!root_node || !menu_root) {
        return null;
    }

    const previous_instance = menu_instances.get(menu_root);

    if (previous_instance) {
        previous_instance.destroy();
    }

    const sections = collect_page_menu_sections(root_node, attr);

    if (sections.length === 0) {
        menu_root.replaceChildren();
        menu_root.hidden = true;
        return null;
    }

    const
        rendered_menu = render_page_menu(menu_root, sections, attr),
        heading_entries = Array.from(rendered_menu.entry_map.values()),
        heading_nodes = heading_entries.map((entry) => entry.heading.node),
        mobile_query = window.matchMedia(attr.mobile_query || default_mobile_query),
        active_offset = attr.active_offset ?? default_active_offset,
        event_controller = new AbortController()
    ;

    let
        active_heading = null,
        frame_request = null
    ;

    function set_expanded(expanded) {
        rendered_menu.toggle_node.setAttribute("aria-expanded", String(expanded));
        rendered_menu.content_node.hidden = !expanded;
        rendered_menu.nav_node.classList.toggle("is_open", expanded);
    }

    function sync_viewport_mode() {
        rendered_menu.nav_node.classList.toggle("is_mobile", mobile_query.matches);
        set_expanded(!mobile_query.matches);
    }

    function set_active_heading(heading_node) {
        if (!heading_node || heading_node === active_heading) {
            return;
        }

        for (const entry of heading_entries) {
            const is_active = entry.heading.node === heading_node;

            entry.item_node.classList.toggle("is_active", is_active);
            entry.link_node.classList.toggle("is_active", is_active);
            entry.item_node.classList.remove("has_active_child");

            if (is_active) {
                entry.link_node.setAttribute("aria-current", "location");

                if (entry.parent_item) {
                    entry.parent_item.classList.add("has_active_child");
                }
            } else {
                entry.link_node.removeAttribute("aria-current");
            }
        }

        active_heading = heading_node;
    }

    function get_scroll_heading() {
        let current_heading = heading_nodes[0];

        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            return heading_nodes[heading_nodes.length - 1];
        }

        for (const heading_node of heading_nodes) {
            if (heading_node.getBoundingClientRect().top <= active_offset) {
                current_heading = heading_node;
            } else {
                break;
            }
        }

        return current_heading;
    }

    function update_active_heading() {
        frame_request = null;
        set_active_heading(get_scroll_heading());
    }

    function schedule_active_update() {
        if (frame_request === null) {
            frame_request = window.requestAnimationFrame(update_active_heading);
        }
    }

    rendered_menu.toggle_node.addEventListener("click", function () {
        set_expanded(rendered_menu.toggle_node.getAttribute("aria-expanded") !== "true");
    }, { signal: event_controller.signal });

    rendered_menu.nav_node.addEventListener("click", function (event) {
        const link_node = event.target.closest(".page_menu_link");

        if (!link_node || !rendered_menu.nav_node.contains(link_node)) {
            return;
        }

        const target_id = decodeURIComponent(link_node.hash.replace(/^#/, ""));
        const target_entry = heading_entries.find((entry) => entry.heading.id === target_id);

        if (target_entry) {
            set_active_heading(target_entry.heading.node);
        }

        if (mobile_query.matches) {
            set_expanded(false);
        }
    }, { signal: event_controller.signal });

    window.addEventListener("scroll", schedule_active_update, {
        passive: true,
        signal: event_controller.signal
    });
    window.addEventListener("resize", schedule_active_update, {
        passive: true,
        signal: event_controller.signal
    });

    mobile_query.addEventListener("change", sync_viewport_mode);
    sync_viewport_mode();

    const hash_id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    const hash_entry = heading_entries.find((entry) => entry.heading.id === hash_id);

    if (hash_entry) {
        set_active_heading(hash_entry.heading.node);
    } else {
        schedule_active_update();
    }

    const instance = {
        destroy: function () {
            event_controller.abort();
            mobile_query.removeEventListener("change", sync_viewport_mode);

            if (frame_request !== null) {
                window.cancelAnimationFrame(frame_request);
            }

            menu_instances.delete(menu_root);
        },
        get_active_id: function () {
            return active_heading ? active_heading.id : "";
        },
        nav_node: rendered_menu.nav_node,
        refresh: schedule_active_update,
        sections: sections
    };

    menu_instances.set(menu_root, instance);

    return instance;
}

export { collect_page_menu_sections, init_page_menu };
