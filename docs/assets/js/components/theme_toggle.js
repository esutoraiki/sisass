const
    theme_light = "light",
    theme_dark = "dark",
    theme_storage_key = "sisass_theme",
    theme_meta_color_light = "#FEFEFE",
    theme_meta_color_dark = "#10151F",
    theme_toggle_url = new URL("../../../components/global/theme_toggle.html", import.meta.url),
    theme_toggle_fallback = '<button id="theme_toggle" class="theme_toggle" type="button" aria-label="Cambiar tema"><span class="icon_light hide"></span><span class="icon_dark"></span></button>'
;

function get_theme() {
    try {
        const stored_theme = window.localStorage.getItem(theme_storage_key);

        if (stored_theme === theme_light || stored_theme === theme_dark) {
            return stored_theme;
        }
    } catch {
        return theme_light;
    }

    return theme_light;
}

function sync_theme_meta(theme_name) {
    const
        theme_color = theme_name === theme_dark ? theme_meta_color_dark : theme_meta_color_light,
        existing_meta = document.querySelector('meta[name="theme-color"]')
    ;

    if (existing_meta) {
        existing_meta.setAttribute("content", theme_color);
        return;
    }

    const
        meta_node = document.createElement("meta")
    ;

    meta_node.setAttribute("name", "theme-color");
    meta_node.setAttribute("content", theme_color);

    if (document.head) {
        document.head.appendChild(meta_node);
    }
}

function sync_theme_toggle(theme_name) {
    const
        trigger = document.getElementById("theme_toggle"),
        icon_light = trigger ? trigger.querySelector(".icon_light") : null,
        icon_dark = trigger ? trigger.querySelector(".icon_dark") : null,
        is_dark = theme_name === theme_dark
    ;

    if (!trigger) {
        return;
    }

    trigger.setAttribute("aria-pressed", String(is_dark));
    trigger.setAttribute("aria-label", is_dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
    trigger.tabIndex = -1;

    if (icon_light) {
        icon_light.classList.toggle("hide", !is_dark);
    }

    if (icon_dark) {
        icon_dark.classList.toggle("hide", is_dark);
    }
}

function set_theme(theme_name) {
    const
        theme_root = document.documentElement,
        resolved_theme = theme_name === theme_dark ? theme_dark : theme_light
    ;

    if (!theme_root) {
        return resolved_theme;
    }

    theme_root.dataset.theme = resolved_theme;
    theme_root.style.colorScheme = resolved_theme;

    sync_theme_meta(resolved_theme);
    sync_theme_toggle(resolved_theme);

    try {
        window.localStorage.setItem(theme_storage_key, resolved_theme);
    } catch {
        return resolved_theme;
    }

    return resolved_theme;
}

function toggle_theme() {
    const
        current_theme = document.documentElement.dataset.theme || theme_light,
        next_theme = current_theme === theme_dark ? theme_light : theme_dark
    ;

    set_theme(next_theme);
}

function toggle_theme_with_transition() {
    const
        toggle_action = () => {
            toggle_theme();
        }
    ;

    if (typeof document.startViewTransition !== "function") {
        toggle_action();
        return;
    }

    document.startViewTransition(toggle_action);
}

async function init_theme_toggle() {
    const
        mount_node = document.getElementById("theme_toggle_mount")
    ;

    if (!mount_node) {
        sync_theme_toggle(document.documentElement.dataset.theme || theme_light);
        return;
    }

    if (!mount_node.dataset.loaded) {
        try {
            const
                response = await fetch(theme_toggle_url)
            ;

            if (!response.ok) {
                throw new Error("Theme toggle component could not be loaded.");
            }

            mount_node.innerHTML = await response.text();
        } catch (error) {
            console.warn("Theme toggle component failed to load.", error);
            mount_node.innerHTML = theme_toggle_fallback;
        }

        mount_node.dataset.loaded = "true";
    }

    const
        trigger = document.getElementById("theme_toggle")
    ;

    if (trigger && trigger.dataset.listenerReady !== "true") {
        trigger.addEventListener("click", function () {
            toggle_theme_with_transition();
        });

        trigger.dataset.listenerReady = "true";
    }

    sync_theme_toggle(document.documentElement.dataset.theme || theme_light);
}

export { get_theme, init_theme_toggle, set_theme, toggle_theme_with_transition };
