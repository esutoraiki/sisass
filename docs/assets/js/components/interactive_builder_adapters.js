function escape_html(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

const button_simple_adapter = {
    create_preview(root) {
        const
            preview_container = root.querySelector("[data-builder-preview-container]"),
            preview_button = document.createElement("button")
        ;

        preview_button.className = "interactive_builder_button_preview";
        preview_button.type = "button";
        preview_button.dataset.builderPreview = "";
        preview_container.replaceChildren(preview_button);
    },

    update_preview(root, state, preview_state) {
        const preview_button = root.querySelector("[data-builder-preview]");

        preview_button.textContent = state.label;
        preview_button.disabled = preview_state === "disabled";
        preview_button.classList.toggle("is_active", preview_state === "active");
    },

    format_html(state, preview_state) {
        const
            state_class = preview_state === "active" ? " active" : "",
            disabled_attribute = preview_state === "disabled" ? " disabled" : ""
        ;

        return [
            "<button",
            "    class=\"button_simple_builder_button" + state_class + "\"",
            "    type=\"button\"" + disabled_attribute,
            ">",
            "    " + escape_html(state.label),
            "</button>"
        ].join("\n");
    },

    get_css_value(field, state, value) {
        if (field.path === "height") {
            return state.aspect_ratio ? "auto" : value;
        }

        if (field.path === "aspect_ratio") {
            return value || "auto";
        }

        return value;
    }
};

const button_style_arrow_adapter = {
    create_preview(root) {
        const
            preview_container = root.querySelector("[data-builder-preview-container]"),
            preview_button = document.createElement("button"),
            content_link = document.createElement("span")
        ;

        preview_button.className = "button_style_arrow_builder_button";
        preview_button.type = "button";
        content_link.className = "content_link";
        preview_button.appendChild(content_link);
        preview_container.replaceChildren(preview_button);
    },

    update_preview(root, state, preview_state) {
        const preview_button = root.querySelector(".button_style_arrow_builder_button");

        preview_button.querySelector(".content_link").textContent = state.label;
        preview_button.disabled = preview_state === "disabled";
        preview_button.classList.toggle("active", preview_state === "active");
        root.dataset.builderIcon = state.icon;
    },

    format_html(state, preview_state) {
        const
            state_class = preview_state === "active" ? " active" : "",
            disabled_attribute = preview_state === "disabled" ? " disabled" : ""
        ;

        return [
            "<button class=\"button_style_arrow_builder_button" + state_class + "\" type=\"button\"" + disabled_attribute + ">",
            "    <span class=\"content_link\">" + escape_html(state.label) + "</span>",
            "</button>"
        ].join("\n");
    },

    get_css_value(field, state, value) {
        if (field.path === "height") {
            return state.aspect_ratio ? "auto" : value;
        }

        if (field.path === "aspect_ratio") {
            return value || "auto";
        }

        if (field.path === "tf.line_height") {
            return value === "none" ? "normal" : value;
        }

        return value;
    }
};

const adapters = {
    button_simple: button_simple_adapter,
    button_style_arrow: button_style_arrow_adapter
};

export function get_interactive_builder_adapter(adapter_id) {
    return adapters[adapter_id] || null;
}
