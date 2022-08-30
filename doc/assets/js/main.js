import { buildNode } from "./core/fn.js";

(function () {
    "use strict";

    const
        s1 = document.getElementById("main_header"),
        s2 = document.getElementById("main_content"),

        p_menu = "../components/menu.html",
        p_content = [
            ["welcome", "../components/welcome.html"],
            ["workflow", "../components/workflow.html"],
            ["src", "../components/src.html"],
            ["vendor_prefix", "../components/vendor_prefix.html"]
        ],

        NSDocumentation = (function () {
            return {
                content: () => {
                    for (let item of p_content) {
                        fetch(item[1])
                            .then((response) => response.text())
                            .then((content) => {
                                buildNode({
                                    content: content,
                                    insert: s2,
                                    position: "beforeend",
                                    attr: [
                                        ["id", "container_" + item[0]],
                                        ["class", "container_" + item[0]]
                                    ]

                                });
                            })
                        ;
                    }
                },

                main_menu: () => {
                    fetch(p_menu)
                        .then((response) => response.text())
                        .then((menu) => {
                            buildNode({
                                content: menu,
                                insert: s1,
                                attr: [
                                    ["id", "container_menu"],
                                    ["class", "container_menu a2"]
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
        NSDocumentation.content();
    });
}());
