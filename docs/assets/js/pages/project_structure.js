import { contentLoad } from "../core/fn.js";
import { init_page_breadcrumb } from "../core/breadcrumb.js";
import { init_hash_navigation } from "../core/hash_navigation.js";
import { loader } from "../core/page_loader.js";
import { init_documentation_search } from "../core/search.js";

(function () {
    "use strict";

    const
        current_page = "documentationpage",
        url_json_project_structure = "json/project_structure.json",

        NSProjectStructure = (function () {
            return {
                content: async () => {
                    loader.register([
                        "content_ready",
                        "navigation_ready",
                        "search_ready"
                    ]);

                    await contentLoad({
                        url: url_json_project_structure
                    });
                    await init_page_breadcrumb({
                        json_url: url_json_project_structure
                    });
                    loader.set("content_ready", true);

                    await init_hash_navigation();
                    loader.set("navigation_ready", true);

                    await init_documentation_search({
                        current_page: current_page
                    });
                    loader.set("search_ready", true);
                }
            };
        }())
    ;

    window.addEventListener("load", async function () {
        await NSProjectStructure.content();
    });
}());
