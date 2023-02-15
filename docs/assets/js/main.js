import { contentLoad } from "./core/fn.js";

(function () {
    "use strict";

    const
        c1 = "active",
        url_json_global = "json/global.json",

        NSDocumentation = (function () {
            return {
                content: () => {
                    contentLoad({
                        url: url_json_global,
                        success: function (id_component) {
                            if (id_component === "menu") {
                                let
                                    s1 = document.getElementsByClassName("documentationpage"),
                                    s2 = document.getElementById("link_" + s1[0].dataset.link)
                                ;

                                s2.classList.add(c1);
                            }
                        }
                    });
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSDocumentation.content();
    });
}());
