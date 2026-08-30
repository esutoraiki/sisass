import { contentLoad } from "../core/fn.js";
import { init_page_breadcrumb } from "../core/breadcrumb.js";
import { init_hash_navigation } from "../core/hash_navigation.js";
import { init_page_menu } from "../core/page_menu.js";
import { loader } from "../core/page_loader.js";
import { init_documentation_search } from "../core/search.js";
import { TabPanel } from "../libraries/tab_panel.min.js";

(function () {
    "use strict";

    const
        currentPage = "documentationpage",
        url_json_base = "json/base.json",


        NSBase = (function () {
            return {
                content: async () => {
                    loader.register([
                        "content_ready",
                        "navigation_ready",
                        "search_ready"
                    ]);

                    await contentLoad({
                        url: url_json_base
                    });

                    const tab_panels = Array.from(document.querySelectorAll("[data-tab-panel]"));

                    for (const tab_panel of tab_panels) {
                        new TabPanel(tab_panel).init();
                    }

                    init_page_menu();

                    await init_page_breadcrumb({
                        json_url: url_json_base
                    });
                    loader.set("content_ready", true);

                    await init_hash_navigation();
                    loader.set("navigation_ready", true);

                    await init_documentation_search({
                        current_page: currentPage
                    });
                    loader.set("search_ready", true);
                }
            };
        }())
    ;

    window.addEventListener("load", async function () {
        await NSBase.content();
    });
}());
