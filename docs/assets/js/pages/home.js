import { contentLoad } from "../core/fn.js";

(function () {
    "use strict";

    const
        url_json = "json/home.json",


        NSHome = (function () {
            return {
                remove_search: () => {
                    const
                        search_node = document.querySelector(".page_search")
                    ;

                    if (search_node) {
                        search_node.remove();
                        return;
                    }

                    window.requestAnimationFrame(NSHome.remove_search);
                },
                content: () => {
                    contentLoad({
                        url: url_json,
                        complete: function () {
                            NSHome.remove_search();
                        }
                    });
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSHome.content();
    });
}());
