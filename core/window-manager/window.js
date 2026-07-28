/* ==========================================
   PolashOS Window Manager v6
   Complete Unified Version
========================================== */

class WindowManager {

    constructor() {
        this.windows = {};
        this.activeWindow = null;
        this.zIndex = 100;
        this.taskbarApps = document.getElementById("taskbar-apps");
    }

    /* ==========================
       Register Window
    ========================== */
    register(id) {
        const element = document.getElementById(id);
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

        this.animateOpen(id);
        this.focus(id);
        this.addTaskbarButton(id);
        this.updateTaskbarState();
    }

    /* ==========================
       Close Window
    ========================== */
    close(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        this.animateClose(id);
        this.removeTaskbarButton(id);
        
        if (this.activeWindow === id) {
            this.activeWindow = null;
        }
        this.updateTaskbarState();
    }

    /* ==========================
       Focus Window
    ========================== */
    focus(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        this.activeWindow = id;
        windowData.element.style.zIndex = ++this.zIndex;
        this.updateTaskbarState();
    }

    /* ==========================
       Check if Window is Open
    ========================== */
    isOpen(id) {
        const windowData = this.get(id);
        if (!windowData) return false;
        return !windowData.element.hidden &&
               windowData.element.style.display !== "none";
    }

    /* ==========================
       Toggle Window
    ========================== */
    toggle(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        if (windowData.minimized) {
            this.restore(id);
            return;
        }

        if (this.isOpen(id)) {
            if (this.activeWindow === id) {
                this.minimize(id);
            } else {
                this.focus(id);
            }
        } else {
            this.open(id);
        }
    }

    /* ==========================
       Minimize Window
    ========================== */
    minimize(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        windowData.element.style.display = "none";
        windowData.minimized = true;

        if (this.activeWindow === id) {
            this.activeWindow = null;
        }
        this.updateTaskbarState();
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
       Animations
    ========================== */
    animateOpen(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        const win = windowData.element;
        win.style.opacity = "0";
        win.style.transform = "scale(.92)";

        requestAnimationFrame(() => {
            win.style.transition = "opacity .25s ease, transform .25s ease";
            win.style.opacity = "1";
            win.style.transform = "scale(1)";
        });
    }

    animateClose(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        const win = windowData.element;
        win.style.transition = "opacity .2s ease, transform .2s ease";
        win.style.opacity = "0";
        win.style.transform = "scale(.95)";

        setTimeout(() => {
            win.hidden = true;
            win.style.display = "none";
            win.style.opacity = "";
            win.style.transform = "";
        }, 200);
    }

    /* ==========================
       Taskbar Management
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
            this.toggle(id);
        });

        this.taskbarApps.appendChild(button);
    }

    removeTaskbarButton(id) {
        const button = document.getElementById(`task-${id}`);
        if (button) {
            button.remove();
        }
    }

    updateTaskbarState() {
        document.querySelectorAll(".taskbar-app").forEach(btn => {
            btn.classList.remove("active");
        });

        if (!this.activeWindow) return;

        const btn = document.getElementById(`task-${this.activeWindow}`);
        if (btn) {
            btn.classList.add("active");
        }
    }

    /* ==========================
       Drag System
    ========================== */
    makeDraggable(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        const win = windowData.element;
        const titlebar = win.querySelector(".window-titlebar");
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
            win.style.left = `${e.clientX - offsetX}px`;
            win.style.top = `${e.clientY - offsetY}px`;
        });

        document.addEventListener("mouseup", () => {
            dragging = false;
            document.body.style.userSelect = "";
        });
    }

    attachFocus(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        windowData.element.addEventListener("mousedown", () => {
            this.focus(id);
        });
    }

    /* ==========================
       Initialize
    ========================== */
    initialize() {
        Object.keys(this.windows).forEach(id => {
            this.makeDraggable(id);
            this.attachFocus(id);

            const win = this.windows[id].element;
            const closeBtn = win.querySelector(".window-close");
            const minimizeBtn = win.querySelector(".window-minimize");

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
   Global Window Manager Initialization
========================================== */

const windowManager = new WindowManager();
window.windowManager = windowManager; // গ্লোবালি বাইন্ড করা হলো

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
