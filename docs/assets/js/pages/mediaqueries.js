import { contentLoad } from "../core/fn.js";
import { init_documentation_search } from "../core/search.js";

(function () {
    "use strict";

    const
        currentPage = "documentationpage",
        url_json_base = "json/mediaqueries.json",

        NSBase = (function () {
            return {
                content: () => {
                    contentLoad({
                        url: url_json_base,
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
        NSBase.content();
    });
}());
