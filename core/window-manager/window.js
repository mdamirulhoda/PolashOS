/* ==========================================
   PolashOS Window Manager v4
   Part 1
========================================== */

class WindowManager {

    constructor() {

        this.windows = {};

        this.activeWindow = null;

        this.zIndex = 100;

        this.taskbarApps =
            document.getElementById("taskbar-apps");

    }

    /* ==========================
       Register Window
    ========================== */

    register(id) {

        const element =
            document.getElementById(id);

        if (!element) {

            console.warn(`Window not found: ${id}`);

            return;

        }

        this.windows[id] = {

            element,

            minimized: false,

            maximized: false

        };

        element.style.position = "absolute";

        element.style.zIndex = ++this.zIndex;

    }

    /* ==========================
       Get Window
    ========================== */

    get(id) {

        return this.windows[id] || null;

    }

    /* ==========================
       Open Window
    ========================== */

    open(id) {

        const windowData = this.get(id);

        if (!windowData) return;

        const element = windowData.element;

        element.hidden = false;

        element.style.display = "block";

        windowData.minimized = false;

        this.focus(id);

        this.addTaskbarButton(id);

    }

    /* ==========================
       Close Window
    ========================== */

    close(id) {

        const windowData = this.get(id);

        if (!windowData) return;

        windowData.element.hidden = true;

        windowData.minimized = false;

        this.removeTaskbarButton(id);

    }

    /* ==========================
       Focus Window
    ========================== */

    focus(id) {

        const windowData = this.get(id);

        if (!windowData) return;

        this.activeWindow = id;

        windowData.element.style.zIndex =
            ++this.zIndex;

    }
    /* ==========================
       Drag System
    ========================== */

    makeDraggable(id) {

        const windowData = this.get(id);

        if (!windowData) return;

        const win = windowData.element;

        const titlebar =
            win.querySelector(".window-titlebar");

        if (!titlebar) return;

        let dragging = false;

        let offsetX = 0;

        let offsetY = 0;

        titlebar.addEventListener("mousedown", (e) => {

            dragging = true;

            this.focus(id);

            offsetX = e.clientX - win.offsetLeft;

            offsetY = e.clientY - win.offsetTop;

            document.body.style.userSelect = "none";

        });

        document.addEventListener("mousemove", (e) => {

            if (!dragging) return;

            win.style.left =
                `${e.clientX - offsetX}px`;

            win.style.top =
                `${e.clientY - offsetY}px`;

        });

        document.addEventListener("mouseup", () => {

            dragging = false;

            document.body.style.userSelect = "";

        });

    }

    /* ==========================
       Bring Window To Front
    ========================== */

    attachFocus(id) {

        const windowData = this.get(id);

        if (!windowData) return;

        windowData.element.addEventListener("mousedown", () => {

            this.focus(id);

        });

    }

    /* ==========================
       Minimize Window
    ========================== */

    minimize(id) {

        const windowData = this.get(id);

        if (!windowData) return;

        windowData.element.style.display = "none";

        windowData.minimized = true;

    }

    /* ==========================
       Restore Window
    ========================== */

    restore(id) {

        const windowData = this.get(id);

        if (!windowData) return;

        windowData.element.style.display = "block";

        windowData.minimized = false;

        this.focus(id);

    }
    /* ==========================
       Taskbar Buttons
    ========================== */

    addTaskbarButton(id) {

        if (!this.taskbarApps) return;

        if (document.getElementById(`task-${id}`)) return;

        const button = document.createElement("button");

        button.id = `task-${id}`;

        button.className = "taskbar-app";

        const title = this.windows[id]
            .element
            .querySelector(".window-titlebar span")
            ?.textContent || id;

        button.textContent = title;

        button.addEventListener("click", () => {

            const windowData = this.get(id);

            if (!windowData) return;

            if (windowData.minimized) {

                this.restore(id);

            } else {

                this.focus(id);

            }

        });

        this.taskbarApps.appendChild(button);

    }

    removeTaskbarButton(id) {

        const button =
            document.getElementById(`task-${id}`);

        if (button) {

            button.remove();

        }

    }

    /* ==========================
       Initialize
    ========================== */

    initialize() {

        Object.keys(this.windows).forEach(id => {

            this.makeDraggable(id);

            this.attachFocus(id);

            const win = this.windows[id].element;

            const closeBtn =
                win.querySelector(".window-close");

            const minimizeBtn =
                win.querySelector(".window-minimize");

            if (closeBtn) {

                closeBtn.addEventListener("click", () => {

                    this.close(id);

                });

            }

            if (minimizeBtn) {

                minimizeBtn.addEventListener("click", () => {

                    this.minimize(id);

                });

            }

        });

    }

}

/* ==========================================
   Global Window Manager
========================================== */

const windowManager = new WindowManager();

document.addEventListener("DOMContentLoaded", () => {

    [

        "browser-window",

        "files-window",

        "terminal-window",

        "control-window"

    ].forEach(id => {

        windowManager.register(id);

    });

    windowManager.initialize();

});
