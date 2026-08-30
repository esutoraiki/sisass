import { contentLoad } from "../core/fn.js";
import { init_page_breadcrumb } from "../core/breadcrumb.js";
import { init_hash_navigation } from "../core/hash_navigation.js";
import { init_page_menu } from "../core/page_menu.js";
import { loader } from "../core/page_loader.js";
import { init_documentation_search } from "../core/search.js";

/* global TreeConvertJson TreeViewer */

(function () {
    "use strict";

    const
        current_page = "documentationpage",
        url_json_project_structure = "json/project_structure.json",
        url_project_tree = "text/tree",
        url_icon_file = "img/svg/file.svg",
        url_icon_folder = "img/svg/folder.svg",
        url_icon_js = "img/svg/js.svg",
        url_icon_root = "img/svg/root.svg",
        url_icon_sass = "img/svg/sass.svg",

        NSProjectStructure = (function () {
            async function init_project_tree() {
                const tree_node = document.getElementById("project_structure_tree");

                if (!tree_node || typeof TreeConvertJson === "undefined" || typeof TreeViewer === "undefined") {
                    return;
                }

                try {
                    const tree_response = await fetch(url_project_tree);

                    if (!tree_response.ok) {
                        throw new Error("Unable to load the project tree source.");
                    }

                    const tree_source = await tree_response.text();
                    const tree_converter = new TreeConvertJson({
                        source: tree_source
                    });
                    const tree_data = tree_converter.convert();
                    const tree_viewer = new TreeViewer(tree_node, {
                        format: "json",
                        source: tree_data,
                        title: "Árbol del repositorio",
                        show_icons: true,
                        folder_icon: url_icon_folder,
                        file_icon: url_icon_file,
                        default_icon: url_icon_file,
                        icon_resolver: function (node) {
                            const node_name = String(node?.name ?? "").toLowerCase();

                            if (node_name === ".") {
                                return url_icon_root;
                            }

                            if (node_name.endsWith(".js")) {
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
                    tree_node.textContent = "No se pudo cargar el mapa principal del repositorio.";
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
                        url: url_json_project_structure
                    });
                    await init_project_tree();
                    init_page_menu();
                    await init_page_breadcrumb({
                        json_url: url_json_project_structure
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
        await NSProjectStructure.content();
    });
}());
