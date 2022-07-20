import { buildNode } from "./core/fn.js";

(function () {
    "use strict";

    const
        // s0 = document.body,
        s1 = document.getElementById("main_header"),

        NSDocumentation = (function () {
            return {
                main_menu: () => {
                    fetch("../components/menu.html")
                        .then((response) => response.text())
                        .then((menu) => {
                            buildNode({
                                content: menu,
                                insert: s1,
                                attr: [
                                    ["id", "container_menu"],
                                    ["class", "container_menu m1"]
                                ]
                            });
                        })
                    ;
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSDocumentation.main_menu();
    });
}());
