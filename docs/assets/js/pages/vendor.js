import { contentLoad } from "../core/fn.js";
import { init_page_breadcrumb } from "../core/breadcrumb.js";
import { init_hash_navigation } from "../core/hash_navigation.js";
import { loader } from "../core/page_loader.js";
import { init_documentation_search } from "../core/search.js";

(function () {
    "use strict";

    const
        currentPage = "documentationpage",
        url_json_vendor = "json/vendor.json",

        NSVendor = (function () {
            return {
                init_animation_fill_mode_example: () => {
                    const
                        replay_button = document.querySelector("[data-animation-replay=\"animation-fill-mode\"]"),
                        animation_boxes = document.querySelectorAll("[data-animation-box=\"animation-fill-mode\"]")
                    ;

                    if (!replay_button || animation_boxes.length === 0) {
                        return;
                    }

                    replay_button.addEventListener("click", () => {
                        animation_boxes.forEach((animation_box) => {
                            animation_box.classList.remove("is_running");
                            void animation_box.offsetWidth;
                            animation_box.classList.add("is_running");
                        });
                    });
                },
                content: async () => {
                    loader.register([
                        "content_ready",
                        "navigation_ready",
                        "search_ready"
                    ]);

                    await contentLoad({
                        url: url_json_vendor
                    });
                    await init_page_breadcrumb({
                        json_url: url_json_vendor
                    });
                    loader.set("content_ready", true);

                    await init_hash_navigation();
                    loader.set("navigation_ready", true);

                    await init_documentation_search({
                        current_page: currentPage
                    });
                    NSVendor.init_animation_fill_mode_example();
                    loader.set("search_ready", true);
                }
            };
        }())
    ;

    window.addEventListener("load", async function () {
        await NSVendor.content();
    });
}());
