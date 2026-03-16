import { contentLoad } from "./core/fn.js";

(function () {
    "use strict";

    const
        c1 = "active",
        c2 = "hide",
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
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSDocumentation.content();
    });
}());
