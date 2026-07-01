import { contentLoad } from "../core/fn.js";
import { init_hash_navigation } from "../core/hash_navigation.js";
import { loader } from "../core/page_loader.js";

(function () {
    "use strict";

    const
        url_json = "json/home.json",

        NSHome = (function () {
            return {
                remove_search: async () => {
                    await new Promise((resolve) => {
                        const wait_for_search = function () {
                            const
                                search_node = document.querySelector(".page_search")
                            ;

                            if (search_node) {
                                search_node.remove();
                                resolve();
                                return;
                            }

                            window.requestAnimationFrame(wait_for_search);
                        };

                        wait_for_search();
                    });
                },
                content: async () => {
                    loader.register([
                        "content_ready",
                        "navigation_ready"
                    ]);

                    await contentLoad({ url: url_json });
                    loader.set("content_ready", true);

                    await NSHome.remove_search();
                    await init_hash_navigation();
                    loader.set("navigation_ready", true);
                }
            };
        }())
    ;

    window.addEventListener("load", async function () {
        await NSHome.content();
    });
}());
