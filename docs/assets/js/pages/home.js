import { contentLoad } from "../core/fn.js";
import { init_documentation_search } from "../core/search.js";

(function () {
    "use strict";

    const
        url_json = "json/home.json",


        NSHome = (function () {
            return {
                content: () => {
                    contentLoad({
                        url: url_json,
                        complete: function () {
                            init_documentation_search();
                        }
                    });
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSHome.content();
    });
}());
