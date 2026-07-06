import { contentLoad } from "./core/fn.js";
import { loader } from "./core/page_loader.js";

(function () {
    "use strict";

    const
        c1 = "active",
        c2 = "hide",
        c3 = "open",
        c4 = "no_scroll",
        c5 = "close",

        theme_light = "light",
        theme_dark = "dark",
        theme_storage_key = "sisass_theme",
        theme_meta_color_light = "#FEFEFE",
        theme_meta_color_dark = "#10151F",
        mobile_breakpoint = 980,
        url_json_global = "json/global.json",

        NSDocumentation = (function () {
            let is_menu_locked = false;

            return {
                close_menu: () => {
                    const
                        body = document.body,
                        menu = document.getElementById("container_menu"),
                        trigger = document.getElementById("menu_close")
                    ;

                    if (!body || !menu || !trigger) {
                        return;
                    }

                    menu.classList.remove(c3);
                    trigger.classList.remove(c3);
                    trigger.classList.add(c5);
                    body.classList.remove(c4);
                    trigger.setAttribute("aria-expanded", "false");
                    trigger.setAttribute("aria-label", "Abrir navegación");
                },

                get_theme: () => {
                    try {
                        const stored_theme = window.localStorage.getItem(theme_storage_key);

                        if (stored_theme === theme_light || stored_theme === theme_dark) {
                            return stored_theme;
                        }
                    } catch {
                        return theme_light;
                    }

                    return theme_light;
                },

                sync_theme_meta: (theme_name) => {
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
                },

                sync_theme_toggle: (theme_name) => {
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
                        icon_light.classList.toggle(c2, !is_dark);
                    }

                    if (icon_dark) {
                        icon_dark.classList.toggle(c2, is_dark);
                    }
                },

                set_theme: (theme_name) => {
                    const
                        theme_root = document.documentElement,
                        resolved_theme = theme_name === theme_dark ? theme_dark : theme_light
                    ;

                    if (!theme_root) {
                        return resolved_theme;
                    }

                    theme_root.dataset.theme = resolved_theme;
                    theme_root.style.colorScheme = resolved_theme;

                    NSDocumentation.sync_theme_meta(resolved_theme);
                    NSDocumentation.sync_theme_toggle(resolved_theme);

                    try {
                        window.localStorage.setItem(theme_storage_key, resolved_theme);
                    } catch {
                        return resolved_theme;
                    }

                    return resolved_theme;
                },

                toggle_theme: () => {
                    const
                        current_theme = document.documentElement.dataset.theme || theme_light,
                        next_theme = current_theme === theme_dark ? theme_light : theme_dark
                    ;

                    NSDocumentation.set_theme(next_theme);
                },

                bind_theme: () => {
                    const
                        trigger = document.getElementById("theme_toggle")
                    ;

                    if (!trigger || trigger.dataset.listenerReady === "true") {
                        NSDocumentation.sync_theme_toggle(document.documentElement.dataset.theme || theme_light);
                        return;
                    }

                    trigger.addEventListener("click", function () {
                        NSDocumentation.toggle_theme();
                    });

                    trigger.tabIndex = -1;
                    trigger.dataset.listenerReady = "true";

                    NSDocumentation.sync_theme_toggle(document.documentElement.dataset.theme || theme_light);
                },

                bind_menu: () => {
                    const
                        body = document.body,
                        trigger = document.getElementById("menu_close"),
                        menu = document.getElementById("container_menu")
                    ;

                    if (!body || !trigger || !menu || trigger.dataset.listenerReady === "true") {
                        return;
                    }

                    function toggle_menu() {
                        if (is_menu_locked) {
                            return;
                        }

                        const is_open = !menu.classList.contains(c3);

                        if (is_open) {
                            trigger.classList.remove(c5);
                        } else {
                            trigger.classList.add(c5);
                        }

                        trigger.classList.toggle(c3, is_open);
                        menu.classList.toggle(c3, is_open);
                        body.classList.toggle(c4, is_open);
                        trigger.setAttribute("aria-expanded", String(is_open));
                        trigger.setAttribute("aria-label", is_open ? "Cerrar navegación" : "Abrir navegación");

                        is_menu_locked = true;

                        window.setTimeout(function () {
                            is_menu_locked = false;
                        }, 650);
                    }

                    trigger.addEventListener("click", function () {
                        toggle_menu();
                    });

                    trigger.addEventListener("keydown", function (event) {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggle_menu();
                        }
                    });

                    window.addEventListener("keydown", function (event) {
                        if (event.key === "Escape") {
                            NSDocumentation.close_menu();
                        }
                    });

                    window.addEventListener("resize", function () {
                        if (window.innerWidth > mobile_breakpoint) {
                            NSDocumentation.close_menu();
                        }
                    });

                    for (const item of menu.getElementsByTagName("a")) {
                        item.addEventListener("click", function () {
                            if (window.innerWidth <= mobile_breakpoint) {
                                NSDocumentation.close_menu();
                            }
                        });
                    }

                    trigger.dataset.listenerReady = "true";
                },

                content: async () => {
                    const
                        body = document.body,
                        current_page = body && body.dataset.link ? "docs" : "home"
                    ;

                    loader.register([
                        "shell_ready"
                    ]);

                    await contentLoad({
                        url: url_json_global,
                        current_page: current_page,
                        success: function (id_component) {
                            if (id_component === "menu") {
                                let
                                    s1 = document.getElementsByClassName("documentationpage"),
                                    s2 = s1.length > 0 ? s1[0] : null,
                                    s3 = s2 ? s2.dataset.link : "",
                                    s4 = s3 !== "" ? document.getElementById("link_" + s3) : null,
                                    s5 = s3 !== "" ? document.getElementById("submenu_" + s3) : null
                                ;

                                if (s4) {
                                    s4.classList.add(c1);
                                }

                                if (s5) {
                                    s5.classList.remove(c2);
                                }
                            }
                        }
                    });

                    if (current_page === "home") {
                        const
                            menu_trigger = document.getElementById("menu_close")
                        ;

                        if (menu_trigger) {
                            menu_trigger.remove();
                        }
                    }

                    NSDocumentation.bind_theme();
                    NSDocumentation.bind_menu();
                    loader.set("shell_ready", true);
                }
            };
        }())
    ;

    NSDocumentation.set_theme(NSDocumentation.get_theme());

    window.addEventListener("load", async function () {
        loader.start();
        await NSDocumentation.content();
    });
}());

(function preventDummyLinksDelegated() {
  document.addEventListener("click", function (e) {
    const a = e.target.closest("a[href]");
    if (!a) return;

    const href = (a.getAttribute("href") || "").trim();
    if (href === "" || href === "#") {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
