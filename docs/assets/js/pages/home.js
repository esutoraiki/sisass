import { contentLoad } from "../core/fn.js";
import { init_hash_navigation } from "../core/hash_navigation.js";
import { loader } from "../core/page_loader.js";
import { init_documentation_search } from "../core/search.js";

(function () {
    "use strict";

    const
        url_json = "json/home.json",
        current_page = "documentationpage",

        NSHome = (function () {
            return {
                content: async () => {
                    loader.register([
                        "content_ready",
                        "navigation_ready",
                        "search_ready"
                    ]);

                    await contentLoad({ url: url_json });
                    loader.set("content_ready", true);

                    await init_hash_navigation();
                    loader.set("navigation_ready", true);

                    await init_documentation_search({
                        current_page
                    });
                    loader.set("search_ready", true);
                }
            };
        }())
    ;

    window.addEventListener("load", async function () {
        await NSHome.content();
    });
}());
