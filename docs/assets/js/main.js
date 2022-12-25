import { contentLoad } from "./core/fn.js";

(function () {
    "use strict";

    const
        url_json_global = "json/global.json",


        NSDocumentation = (function () {
            return {
                content: () => {
                    contentLoad({ url: url_json_global });
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSDocumentation.content();
    });
}());
