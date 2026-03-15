import { contentLoad } from "../core/fn.js";
import { init_documentation_search } from "../core/search.js";

(function () {
    "use strict";

    const
        url_json_base = "json/mediaqueries.json",

        NSBase = (function () {
            return {
                content: () => {
                    contentLoad({
                        url: url_json_base,
                        complete: function () {
                            init_documentation_search();
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
