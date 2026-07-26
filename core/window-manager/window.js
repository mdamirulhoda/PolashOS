/* ==========================================
   PolashOS Window Manager v2
   Part 1
========================================== */

class WindowManager {

    constructor() {

        this.windows = {};

        this.activeWindow = null;

        this.zIndex = 100;

    }

    /* ==========================
       Register Window
    ========================== */

    register(id) {

        const win = document.getElementById(id);

        if (!win) {

            console.warn("Window not found:", id);

            return;

        }

        this.windows[id] = win;

        win.style.position = "absolute";

        win.style.zIndex = ++this.zIndex;

    }

    /* ==========================
       Open Window
    ========================== */

    open(id) {

        const win = this.windows[id];

        if (!win) return;

        win.hidden = false;

        win.style.display = "block";

        this.focus(id);

    }

    /* ==========================
       Close Window
    ========================== */

    close(id) {

        const win = this.windows[id];

        if (!win) return;

        win.hidden = true;

    }

    /* ==========================
       Focus Window
    ========================== */

    focus(id) {

        const win = this.windows[id];

        if (!win) return;

        this.activeWindow = id;

        win.style.zIndex = ++this.zIndex;

           }

    /* ==========================
       Drag System
    ========================== */

    makeDraggable(id) {

        const win = this.windows[id];

        if (!win) return;

        const titlebar = win.querySelector(".window-titlebar");

        if (!titlebar) return;

        let isDragging = false;

        let startX = 0;

        let startY = 0;

        let left = 0;

        let top = 0;

        titlebar.addEventListener("mousedown", (e) => {

            isDragging = true;

            this.focus(id);

            startX = e.clientX;

            startY = e.clientY;

            left = win.offsetLeft;

            top = win.offsetTop;

            document.body.style.userSelect = "none";

        });

        document.addEventListener("mousemove", (e) => {

            if (!isDragging) return;

            const dx = e.clientX - startX;

            const dy = e.clientY - startY;

            win.style.left = (left + dx) + "px";

            win.style.top = (top + dy) + "px";

        });

        document.addEventListener("mouseup", () => {

            isDragging = false;

            document.body.style.userSelect = "";

        });

    }

    /* ==========================
       Register Drag Automatically
    ========================== */

    initialize() {

        Object.keys(this.windows).forEach(id => {

            this.makeDraggable(id);

        });

    }

}

/* ==========================================
   Global Window Manager
========================================== */

const windowManager = new WindowManager();

document.addEventListener("DOMContentLoaded", () => {

    const windows = [

        "browser-window",

        "files-window",

        "terminal-window",

        "control-window"

    ];

    windows.forEach(id => {

        windowManager.register(id);

    });

    windowManager.initialize();

});
