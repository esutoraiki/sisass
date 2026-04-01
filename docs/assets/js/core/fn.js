// Update: 20220619
/** @module js/core/ */

const
    checkLoad = new Proxy([], {
        set: (target, property, value) => {
            let load = true;

            target[property] = value;

            for (let item of target) {
                if (!item) load = false;
            }

            if (load) {
                let prism = document.createElement("script");

                prism.src = "js/libraries/prism.js";
                document.head.insertAdjacentElement("beforeend", prism);
            }

            return true;
        }
    })
;

function contentLoad(attr = {}) {
    let
        url = attr.url || null,
        success = attr.success || (function () { return undefined; }),
        complete = attr.complete || (function () { return undefined; })
    ;

    fetch(url)
        .then(response => response.json())
        .then((data) => {
            let
                pending_components = data.components.length
            ;

            if (pending_components === 0) {
                complete();
                return;
            }

            for (const element in data.components) {
                const
                    component = data.components[element]
                ;

                checkLoad[element] = false;

                fetch(component.url)
                    .then((text) => text.text())
                    .then((content) => {
                        let
                            node_insert = document.getElementById(component.node),
                            class_add = (component.class !== undefined) ? component.class : ""
                        ;

                        buildNode({
                            content: content,
                            insert: node_insert,
                            position: component.position,
                            attr: [
                                ["id", "container_" + component.id],
                                ["class", "container_" + component.id + " " + class_add]
                            ],
                            success: () => {
                                checkLoad[element] = true;
                                success(component.id);
                                pending_components -= 1;

                                if (pending_components === 0) {
                                    complete();
                                }
                            }
                        });
                    })
                ;
            }
        })
        .catch(function (err) {
            console.warn('Something went wrong.', err);
        })
    ;

    return false;
}

/*
 * Load Ajax
 * @parms {object} attr
 * @parms {string} attr.url URL to make the request through AJAX
 * @parms {string} attr.method the type of request: GET or POST
 * @parms {boolean} attr.async true (asynchronous) or false (synchronous)
 * @return {Promise}
 */
function loadAjax(attr = {}) {
    let
        url = attr.url || null,
        method = attr.method || "GET",
        asynca = attr.async || true
    ;

    if (url !== null) {
        return new Promise((resolve, reject) => {
            let
                ajax = new XMLHttpRequest()
            ;

            ajax.open(method, url, asynca);

            ajax.onload = function () {
                if (ajax.status === 200) {
                    resolve(ajax.responseText);
                } else {
                    reject(Error(ajax.statusText));
                }
            };

            ajax.onerror = function () {
                reject(Error("Network error"));
            };

            ajax.send();
        });
    } else {
        console.error("LoadAjax requires the URL parameter");
    }

    return false;
}

/*
 * Buil Node
 * Constructor of nodes (elements) to add in HTML
 * @parms {object} attr
 * @parms {string} attr.type=div Type of node (element)
 * @parms {(string|HTML)} attr.content Content of node (element)
 * @parms {object[]} attr.attr Attributes for the node (element)
 * @return {Node}
 */
function buildNode(attr = {}) {
    let
        type = attr.type || "div",
        content = attr.content || "",
        attr_node = attr.attr || [],
        insert_node = attr.insert || false,
        position = attr.position || "afterend",

        success = attr.success || function () { return undefined; },

        attr_o = null,
        node = null
    ;

    // Load content
    node = document.createElement(type);

    if (attr_node.length > 0) {
        for (let attribute of attr_node) {
            attr_o = document.createAttribute(attribute[0]);
            attr_o.nodeValue = attribute[1];
            node.setAttributeNode(attr_o);
        }
    }

    node.innerHTML = content;

    // Insert node
    if (insert_node) {
        insert_node.insertAdjacentElement(position, node);
        success();
    }

    return node;
}

async function loadPageTemplates(attr = {}) {
    const
        url = attr.url || "templates/templates.html",
        current_page = attr.current_page || "both",
        insert_node = attr.insert || document.body,
        position = attr.position || "beforeend",
        template_ids = attr.template_ids || []
    ;

    if (!insert_node) {
        return [];
    }

    if (template_ids.length > 0) {
        const
            has_all_templates = template_ids.every((template_id) => document.getElementById(template_id))
        ;

        if (has_all_templates) {
            return template_ids.map((template_id) => document.getElementById(template_id));
        }
    } else {
        const
            existing_templates = Array.from(document.querySelectorAll("template[data-page]"))
                .filter((template_node) => {
                    const
                        page_target = template_node.dataset.page || "both"
                    ;

                    return page_target === "both" || page_target === current_page;
                })
        ;

        if (existing_templates.length > 0) {
            return existing_templates;
        }
    }

    try {
        const
            templates = await loadAjax({
                url: url
            }),
            container = document.createElement("div"),
            filtered_templates = []
        ;

        container.innerHTML = templates;

        for (const template_node of container.querySelectorAll("template")) {
            const
                page_target = template_node.dataset.page || "both",
                already_exists = template_node.id !== "" && document.getElementById(template_node.id)
            ;

            if (page_target !== "both" && page_target !== current_page) {
                continue;
            }

            if (already_exists) {
                filtered_templates.push(document.getElementById(template_node.id));
                continue;
            }

            const
                cloned_template = template_node.cloneNode(true)
            ;

            filtered_templates.push(cloned_template);
        }

        if (filtered_templates.length > 0) {
            insert_node.insertAdjacentHTML(
                position,
                filtered_templates.map((template_node) => template_node.outerHTML).join("")
            );
        }

        return filtered_templates.map((template_node) => document.getElementById(template_node.id));
    } catch (err) {
        console.error(err);
    }

    return [];
}

export { loadAjax, buildNode, checkLoad, contentLoad, loadPageTemplates };
