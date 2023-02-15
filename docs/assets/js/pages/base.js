import { contentLoad } from "../core/fn.js";

(function () {
    "use strict";

    const
        url_json_base = "json/base.json",


        NSBase = (function () {
            return {
                content: () => {
                    contentLoad({ url: url_json_base });
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSBase.content();
    });
}());
