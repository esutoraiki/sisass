import { contentLoad } from "../core/fn.js";
import { init_hash_navigation } from "../core/hash_navigation.js";
import { init_documentation_search } from "../core/search.js";

(function () {
    "use strict";

    const
        currentPage = "documentationpage",
        url_json_base = "json/base.json",


        NSBase = (function () {
            return {
                content: async () => {
                    await contentLoad({
                        url: url_json_base
                    });

                    init_hash_navigation();
                    init_documentation_search({
                        current_page: currentPage
                    });
                }
            };
        }())
    ;

    window.addEventListener("load", async function () {
        await NSBase.content();
    });
}());
