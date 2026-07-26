/* ==========================================
   PolashOS Window Manager v1
   Core Engine
   ========================================== */

class WindowManager {

    constructor() {

        this.windows = {};

        this.zIndex = 100;

    }

    register(id) {

        const element = document.getElementById(id);

        if (!element) {

            console.warn(`Window not found: ${id}`);

            return;

        }

        this.windows[id] = element;

    }

    open(id) {

        const win = this.windows[id];

        if (!win) return;

        win.hidden = false;

        this.focus(id);

    }

    close(id) {

        const win = this.windows[id];

        if (!win) return;

        win.hidden = true;

    }

    toggle(id) {

        const win = this.windows[id];

        if (!win) return;

        if (win.hidden) {

            this.open(id);

        } else {

            this.close(id);

        }

    }

    focus(id) {

        const win = this.windows[id];

        if (!win) return;

        this.zIndex++;

        win.style.zIndex = this.zIndex;

    }

}

/* ==========================================
   Global Instance
   ========================================== */

const windowManager = new WindowManager();
