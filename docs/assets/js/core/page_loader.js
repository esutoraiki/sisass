function create_loader(attr = {}) {
    const
        loader_id = attr.loader_id || "loader",
        lock_class = attr.lock_class || "no_scroll",
        closing_class = attr.closing_class || "close",
        hidden_class = attr.hidden_class || "hide",
        fade_delay = attr.fade_delay ?? 250,
        hide_delay = attr.hide_delay ?? 300,
        state_map = new Map()
    ;

    let
        started = false,
        closed = false
    ;

    function get_loader_node() {
        return document.getElementById(loader_id);
    }

    function get_lock_nodes() {
        return document.getElementsByClassName(lock_class);
    }

    function is_ready() {
        if (state_map.size === 0) {
            return false;
        }

        for (const value of state_map.values()) {
            if (!value) {
                return false;
            }
        }

        return true;
    }

    function unlock_scroll() {
        const
            lock_nodes = get_lock_nodes()
        ;

        for (const node of lock_nodes) {
            node.classList.remove(lock_class);
        }
    }

    function close_loader() {
        const
            loader_node = get_loader_node()
        ;

        if (!loader_node || closed) {
            unlock_scroll();
            closed = true;
            return;
        }

        closed = true;
        loader_node.classList.add(closing_class);

        window.setTimeout(function () {
            unlock_scroll();

            window.setTimeout(function () {
                loader_node.classList.add(hidden_class);
            }, hide_delay);
        }, fade_delay);
    }

    function check_ready() {
        if (!started || closed) {
            return;
        }

        if (is_ready()) {
            close_loader();
        }
    }

    return {
        register: function (keys = []) {
            for (const key of keys) {
                if (!state_map.has(key)) {
                    state_map.set(key, false);
                }
            }

            check_ready();
        },
        start: function () {
            started = true;
            check_ready();
        },
        set: function (key, value) {
            state_map.set(key, Boolean(value));
            check_ready();
        },
        get: function (key) {
            return state_map.get(key);
        },
        ready: function () {
            return is_ready();
        },
        debug: function () {
            return Object.fromEntries(state_map.entries());
        }
    };
}

const
    loader = create_loader()
;

export { create_loader, loader };
