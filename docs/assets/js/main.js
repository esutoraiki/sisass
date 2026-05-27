import { contentLoad } from "./core/fn.js";
import { page_loader } from "./core/page_loader.js";

(function () {
    "use strict";

    const
        c1 = "active",
        c2 = "hide",
        c3 = "open",
        c4 = "no_scroll",
        c5 = "close",
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
                    page_loader.register([
                        "shell_ready"
                    ]);

                    await contentLoad({
                        url: url_json_global,
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

                    NSDocumentation.bind_menu();
                    page_loader.set("shell_ready", true);
                }
            };
        }())
    ;

    window.addEventListener("load", async function () {
        page_loader.start();
        await NSDocumentation.content();
    });
}());
