import { contentLoad } from "../core/fn.js";

(function () {
    "use strict";

    const
        url_json = "json/home.json",


        NSHome = (function () {
            return {
                content: () => {
                    contentLoad({ url: url_json });
                }
            };
        }())
    ;

    window.addEventListener("load", function () {
        NSHome.content();
    });
}());
