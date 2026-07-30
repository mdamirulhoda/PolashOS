/* ==========================================
   PolashOS Window Manager v6.5 - Professional Final
========================================== */

class WindowManager {

    constructor() {
        this.windows = {};
        this.activeWindow = null;
        this.zIndex = 100;
        this.taskbarApps = document.getElementById("taskbar-apps");
        this.cascadeOffset = 0;
        this.isInitialized = false;
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
            maximized: false,
            savedRect: null
        };

        const startX = 120 + (this.cascadeOffset * 30);
        const startY = 80 + (this.cascadeOffset * 30);
        this.cascadeOffset = (this.cascadeOffset + 1) % 5;

        element.style.position = "absolute";
        element.style.zIndex = ++this.zIndex;
        element.style.left = startX + "px";
        element.style.top = startY + "px";
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
        windowData.maximized = false;

        setTimeout(() => {
            windowData.minimized = false;
            this.removeTaskbarButton(id);
        }, 200);
        
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

        windowData.element.hidden = true;
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

        windowData.element.hidden = false;
        windowData.element.style.display = "block";
        windowData.minimized = false;
        this.focus(id);
    }

    /* ==========================
       Maximize / Unmaximize Window (Safeguarded)
    ========================== */
    toggleMaximize(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        const win = windowData.element;

        if (!windowData.maximized) {
            const rect = win.getBoundingClientRect();

            windowData.savedRect = {
                top: win.style.top || rect.top + "px",
                left: win.style.left || rect.left + "px",
                width: rect.width + "px",
                height: rect.height + "px"
            };

            const taskbar = document.getElementById("taskbar");
            const taskbarHeight = taskbar ? taskbar.offsetHeight : 64;

            win.style.top = "0px";
            win.style.left = "0px";
            win.style.width = "100%";
            win.style.height = `calc(100% - ${taskbarHeight}px)`;
            win.classList.add("maximized");
            windowData.maximized = true;
        } else {
            // Guard clause to safely restore position & size
            if (windowData.savedRect) {
                win.style.top = windowData.savedRect.top;
                win.style.left = windowData.savedRect.left;
                win.style.width = windowData.savedRect.width;
                win.style.height = windowData.savedRect.height;
            } else {
                win.style.top = "80px";
                win.style.left = "120px";
                win.style.width = "600px";
                win.style.height = "400px";
            }
            win.classList.remove("maximized");
            windowData.maximized = false;
        }
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
       Drag System (Professional)
    ========================== */
    makeDraggable(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        const win = windowData.element;
        const titlebar = win.querySelector(".window-titlebar");
        if (!titlebar) return;

        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;
        let rafId = null;

        titlebar.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            if (e.target.closest("button")) return;
            if (windowData.maximized) return;

            this.focus(id);

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = win.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;

            win.style.transition = "none";
            win.style.willChange = "left, top";

            document.body.style.userSelect = "none";
            document.body.style.cursor = "grabbing";

            const onMouseMove = (e) => {
                if (!isDragging) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const taskbar = document.getElementById("taskbar");
                    const taskbarHeight = taskbar ? taskbar.offsetHeight : 64;

                    const newLeft = Math.max(
                        0,
                        Math.min(window.innerWidth - win.offsetWidth, initialX + dx)
                    );

                    const newTop = Math.max(
                        0,
                        Math.min(
                            window.innerHeight - win.offsetHeight - taskbarHeight,
                            initialY + dy
                        )
                    );

                    win.style.left = newLeft + "px";
                    win.style.top = newTop + "px";
                    win.style.transform = "none";
                });
            };

            const onMouseUp = () => {
                isDragging = false;
                document.body.style.userSelect = "";
                document.body.style.cursor = "";

                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);

                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }

                win.style.willChange = "";
                requestAnimationFrame(() => {
                    win.style.transition = "";
                });
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
    }

    /* ==========================
       Resize System (Professional)
    ========================== */
    makeResizable(id) {
        const windowData = this.get(id);
        if (!windowData) return;

        const win = windowData.element;
        const handle = win.querySelector(".resize-handle");
        if (!handle) return;

        let isResizing = false;
        let startX = 0;
        let startY0 = 0;
        let startWidth = 0;
        let startHeight = 0;

        handle.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            if (windowData.maximized) return;

            e.preventDefault();
            this.focus(id);

            isResizing = true;
            startX = e.clientX;
            startY0 = e.clientY;

            const rect = win.getBoundingClientRect();
            startWidth = rect.width;
            startHeight = rect.height;

            win.style.transition = "none";
            document.body.style.userSelect = "none";

            const onMouseMove = (e) => {
                if (!isResizing) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY0;

                const newWidth = Math.max(350, startWidth + dx);
                const newHeight = Math.max(220, startHeight + dy);

                win.style.width = newWidth + "px";
                win.style.height = newHeight + "px";
            };

            const onMouseUp = () => {
                isResizing = false;
                document.body.style.userSelect = "";

                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);

                requestAnimationFrame(() => {
                    win.style.transition = "";
                });
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
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
        if (this.isInitialized) return;
        this.isInitialized = true;

        Object.keys(this.windows).forEach(id => {
            this.makeDraggable(id);
            this.makeResizable(id);
            this.attachFocus(id);

            const win = this.windows[id].element;
            const closeBtn = win.querySelector(".window-close");
            const minimizeBtn = win.querySelector(".window-minimize");
            const maximizeBtn = win.querySelector(".window-maximize");

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

            if (maximizeBtn) {
                maximizeBtn.addEventListener("click", () => {
                    this.toggleMaximize(id);
                });
            }
        });
    }
}

/* ==========================================
   Global Window Manager Initialization
========================================== */

window.windowManager = window.windowManager || new WindowManager();
const windowManager = window.windowManager;

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

/* ==========================================
   PolashOS Config & Smart Event Handler
========================================== */

const PolashConfig = {
    openMode: "auto"
};

document.addEventListener("DOMContentLoaded", () => {

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    let eventType = "dblclick";
    if (PolashConfig.openMode === "single" || (PolashConfig.openMode === "auto" && isTouchDevice)) {
        eventType = "click";
    }

    [
        "browserIcon",
        "filesIcon",
        "terminalIcon",
        "controlIcon"
    ].forEach(iconId => {

        const icon = document.getElementById(iconId);
        if (!icon) return;

        icon.addEventListener(eventType, () => {
            const map = {
                browserIcon: "browser-window",
                filesIcon: "files-window",
                terminalIcon: "terminal-window",
                controlIcon: "control-window"
            };

            if (window.windowManager) {
                window.windowManager.toggle(map[iconId]);
            }
        });

    });

});
                   
