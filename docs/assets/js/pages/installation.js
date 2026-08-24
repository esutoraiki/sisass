import { contentLoad } from "../core/fn.js";
import { init_page_breadcrumb } from "../core/breadcrumb.js";
import { init_hash_navigation } from "../core/hash_navigation.js";
import { loader } from "../core/page_loader.js";
import { init_documentation_search } from "../core/search.js";
import { TabPanel } from "../libraries/tab_panel.min.js";

/* global TreeViewer */

(function () {
    "use strict";

    const
        current_page = "documentationpage",
        url_json_installation = "json/installation.json",
        url_json_css_modules_tree = "json/components/installation_css_module_tree.json",
        url_icon_file = "img/svg/file.svg",
        url_icon_folder = "img/svg/folder.svg",
        url_icon_js = "img/svg/js.svg",
        url_icon_sass = "img/svg/sass.svg",

        NSInstallation = (function () {
            async function init_css_modules_tree() {
                const tree_node = document.getElementById("installation_css_modules_tree");

                if (!tree_node || typeof TreeViewer === "undefined") {
                    return;
                }

                try {
                    const tree_response = await fetch(url_json_css_modules_tree);

                    if (!tree_response.ok) {
                        throw new Error("Unable to load the CSS Modules tree source.");
                    }

                    const tree_data = await tree_response.json();
                    const tree_viewer = new TreeViewer(tree_node, {
                        format: "json",
                        source: tree_data,
                        title: "Estructura del ejemplo",
                        show_icons: true,
                        folder_icon: url_icon_folder,
                        file_icon: url_icon_file,
                        default_icon: url_icon_file,
                        icon_resolver: function (node) {
                            const node_name = String(node?.name ?? "").toLowerCase();

                            if (node_name.endsWith(".jsx")) {
                                return url_icon_js;
                            }

                            if (node_name.endsWith(".scss")) {
                                return url_icon_sass;
                            }

                            if (node.type === "folder") {
                                return url_icon_folder;
                            }

                            return url_icon_file;
                        }
                    });

                    tree_viewer.init();
                } catch (error) {
                    tree_node.textContent = "No se pudo cargar la estructura del ejemplo.";
                    console.error(error);
                }
            }

            return {
                content: async () => {
                    loader.register([
                        "content_ready",
                        "navigation_ready",
                        "search_ready"
                    ]);

                    await contentLoad({
                        url: url_json_installation
                    });

                    const tab_panels = Array.from(document.querySelectorAll("[data-tab-panel]"));

                    for (const tab_panel of tab_panels) {
                        new TabPanel(tab_panel).init();
                    }

                    await init_css_modules_tree();
                    await init_page_breadcrumb({
                        json_url: url_json_installation
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
        await NSInstallation.content();
    });
}());
