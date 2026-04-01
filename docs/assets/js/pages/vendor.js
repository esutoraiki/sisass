import { contentLoad } from "../core/fn.js";
import { init_documentation_search } from "../core/search.js";

(function () {
    "use strict";

    const
        currentPage = "documentationpage",
        url_json_vendor = "json/vendor.json",

        NSVendor = (function () {
            return {
                content: () => {
                    contentLoad({
                        url: url_json_vendor,
                        complete: function () {
                            init_documentation_search({
                                current_page: currentPage
                            });
                        }
                    });
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSVendor.content();
    });
}());
