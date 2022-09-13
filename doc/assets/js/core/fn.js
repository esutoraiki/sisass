// Update: 20220511
/** @module js/core/ */

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
        window.setTimeout(() => {
            insert_node.insertAdjacentElement(position, node);
            success();
        }, 1000);
    }

    return node;
}

export { loadAjax, buildNode };
