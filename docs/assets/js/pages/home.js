import { contentLoad } from "../core/fn.js";
import { init_hash_navigation } from "../core/hash_navigation.js";

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
                content: async () => {
                    await contentLoad({
                        url: url_json
                    });

                    NSHome.remove_search();
                    init_hash_navigation();
                }
            };
        }())
    ;

    window.addEventListener("load", async function () {
        await NSHome.content();
    });
}());
