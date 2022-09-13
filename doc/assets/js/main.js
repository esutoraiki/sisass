import { buildNode } from "./core/fn.js";

(function () {
    "use strict";

    let
        check_load = new Proxy([], {
            set: (target, property, value) => {
                let load = true;

                target[property] = value;

                for (let item of target) {
                    if (!item) load = false;
                }

                if (load) {
                    let prism = document.createElement("script");

                    prism.src = "js/libraries/prism.js";
                    document.head.insertAdjacentElement("beforeend", prism);
                }

                return true;
            }
        })
    ;

    const
        s1 = document.getElementById("main_header"),
        s2 = document.getElementById("main_content"),

        url_json_components = "json/components.json",


        NSDocumentation = (function () {
            return {
                content: () => {
                    fetch(url_json_components)
                        .then(response => response.json())
                        .then((data) => {
                            for (const element in data.components) {
                                const component = data.components[element];

                                check_load[element] = false;

                                fetch(component.url)
                                    .then((text) => text.text())
                                    .then((content) => {
                                        let
                                            node_insert = (component.id === "menu") ? s1 : s2
                                        ;

                                        buildNode({
                                            content: content,
                                            insert: node_insert,
                                            position: component.position,
                                            attr: [
                                                ["id", "container_" + component.id],
                                                ["class", "container_" + component.id + " " + component.class]
                                            ],
                                            success: () => {
                                                check_load[element] = true;
                                            }
                                        });
                                    })
                                ;
                            }
                        })
                    ;
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSDocumentation.content();
    });
}());
