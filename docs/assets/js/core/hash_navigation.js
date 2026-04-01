import { waitNextFrame, waitTimeout } from "./fn.js";

const
    default_root_selector = "#main_content",
    default_attempts_limit = 24,
    default_stabilization_delay = 900,
    default_correction_delay = 180,
    default_target_offset = 16,
    default_position_tolerance = 6,
    default_correction_attempts = 6
;

function clear_active_targets(root_node) {
    const
        target_nodes = root_node.querySelectorAll(".search_target")
    ;

    for (const target_node of target_nodes) {
        target_node.classList.remove("search_target");
    }
}

function get_target_node(root_node, anchor) {
    const
        section_node = root_node.querySelector("#" + CSS.escape(anchor)),
        article_node = section_node ? section_node.querySelector("article") : null
    ;

    return article_node || section_node;
}

function get_target_scroll_top(target_node, offset = default_target_offset) {
    return window.scrollY + target_node.getBoundingClientRect().top - offset;
}

function focus_target(root_node, anchor, attr = {}) {
    const
        target_node = get_target_node(root_node, anchor),
        behavior = attr.behavior || "smooth",
        offset = attr.offset ?? default_target_offset
    ;

    if (!target_node) {
        return false;
    }

    clear_active_targets(root_node);
    target_node.classList.add("search_target");

    window.scrollTo({
        top: Math.max(0, get_target_scroll_top(target_node, offset)),
        behavior: behavior
    });

    window.setTimeout(function () {
        target_node.classList.remove("search_target");
    }, 1800);

    return true;
}

function update_page_hash(anchor) {
    const
        base_url = window.location.pathname + window.location.search,
        target_url = base_url + "#" + anchor
    ;

    history.replaceState(null, "", target_url);
}

function get_current_hash() {
    return decodeURIComponent(window.location.hash.replace(/^#/, "").trim());
}

async function apply_hash_focus(attr = {}) {
    const
        root_selector = attr.root_selector || default_root_selector,
        attempts_limit = attr.attempts_limit || default_attempts_limit,
        stabilization_delay = attr.stabilization_delay ?? default_stabilization_delay,
        correction_delay = attr.correction_delay ?? default_correction_delay,
        offset = attr.offset ?? default_target_offset,
        position_tolerance = attr.position_tolerance ?? default_position_tolerance,
        correction_attempts = attr.correction_attempts ?? default_correction_attempts
    ;

    if (get_current_hash() === "") {
        return true;
    }

    const get_hash_target = function () {
        const
            root_node = document.querySelector(root_selector),
            current_hash = get_current_hash()
        ;

        if (!root_node || current_hash === "") {
            return null;
        }

        return {
            root_node,
            current_hash,
            target_node: get_target_node(root_node, current_hash)
        };
    };

    const try_focus_current_hash = function (focus_attr = {}) {
        const
            hash_target = get_hash_target()
        ;

        if (!hash_target || !hash_target.target_node) {
            return false;
        }

        return focus_target(hash_target.root_node, hash_target.current_hash, {
            behavior: focus_attr.behavior,
            offset: offset
        });
    };

    const settle_hash_position = async function () {
        for (let index = 0; index < correction_attempts; index += 1) {
            const
                hash_target = get_hash_target()
            ;

            if (!hash_target || !hash_target.target_node) {
                return false;
            }

            const
                target_top = hash_target.target_node.getBoundingClientRect().top,
                delta = target_top - offset
            ;

            if (Math.abs(delta) <= position_tolerance) {
                return true;
            }

            window.scrollBy({
                top: delta,
                behavior: "auto"
            });

            await waitNextFrame();
            await waitTimeout(60);
        }

        return false;
    };

    let attempt = 0;

    const restore_hash_target = function (resolve) {
        if (try_focus_current_hash()) {
            resolve(true);
            return;
        }

        attempt += 1;

        if (attempt < attempts_limit) {
            window.requestAnimationFrame(function () {
                restore_hash_target(resolve);
            });
            return;
        }

        resolve(false);
    };

    await waitNextFrame();
    await waitNextFrame();
    await waitTimeout(stabilization_delay);

    const
        focused = await new Promise((resolve) => {
            restore_hash_target(resolve);
        })
    ;

    if (!focused) {
        return false;
    }

    await waitTimeout(correction_delay);
    await settle_hash_position();

    return true;
}

function init_hash_navigation(attr = {}) {
    const
        root_selector = attr.root_selector || default_root_selector
    ;

    const
        initial_focus = apply_hash_focus(attr)
    ;

    window.addEventListener("hashchange", function () {
        apply_hash_focus({
            root_selector: root_selector,
            attempts_limit: 1,
            stabilization_delay: 0,
            correction_delay: attr.correction_delay
        });
    });

    return initial_focus;
}

export { clear_active_targets, focus_target, init_hash_navigation, update_page_hash };
