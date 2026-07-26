/* ==========================================
   PolashOS - Core Script v1
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       Elements
    ========================== */

    const bootScreen = document.getElementById("boot-screen");
    const bootProgress = document.querySelector(".boot-progress");

    const lockScreen = document.getElementById("lock-screen");
    const unlockBtn = document.getElementById("unlockBtn");

    const desktop = document.getElementById("desktop");

    const startButton = document.getElementById("start-button");
    const startMenu = document.getElementById("start-menu");

    const clock = document.getElementById("clock");

    /* ==========================
       Initial State
    ========================== */

    desktop.style.display = "none";

    lockScreen.hidden = true;

    startMenu.hidden = true;

    /* ==========================
       Boot Process
    ========================== */

    function bootSystem() {

        bootProgress.style.width = "100%";

        setTimeout(() => {

            bootScreen.style.opacity = "0";

            setTimeout(() => {

                bootScreen.style.display = "none";

                lockScreen.hidden = false;

            }, 800);

        }, 2500);

    }

    /* ==========================
       Unlock
    ========================== */

    unlockBtn.addEventListener("click", () => {

        lockScreen.style.display = "none";

        desktop.style.display = "block";

    });

    /* ==========================
       Start Menu
    ========================== */

    startButton.addEventListener("click", () => {

        startMenu.hidden = !startMenu.hidden;

    });

    /* ==========================
       Live Clock
    ========================== */

    function updateClock() {

        const now = new Date();

        const hours = String(now.getHours()).padStart(2, "0");

        const minutes = String(now.getMinutes()).padStart(2, "0");

        clock.textContent = `${hours}:${minutes}`;

    }

    updateClock();

    setInterval(updateClock, 1000);

    /* ==========================
       Browser Window
    ========================== */

    const browserIcon = document.getElementById("browserIcon");

    const browserWindow = document.getElementById("browser-window");

    const closeBrowser = document.getElementById("closeBrowser");

    if (browserIcon && browserWindow && closeBrowser) {

        browserIcon.addEventListener("dblclick", () => {

            browserWindow.hidden = false;

        });

        closeBrowser.addEventListener("click", () => {

            browserWindow.hidden = true;

        });

    }

    /* ==========================
       Window Drag System
    ========================== */

    let isDragging = false;

    let offsetX = 0;
    let offsetY = 0;

    const titleBar = document.querySelector(".window-titlebar");

    if (titleBar && browserWindow) {

        titleBar.addEventListener("mousedown", (event) => {

            isDragging = true;

            offsetX = event.clientX - browserWindow.offsetLeft;
            offsetY = event.clientY - browserWindow.offsetTop;

            browserWindow.style.cursor = "grabbing";

        });

        document.addEventListener("mousemove", (event) => {

            if (!isDragging) return;

            browserWindow.style.left =
                (event.clientX - offsetX) + "px";

            browserWindow.style.top =
                (event.clientY - offsetY) + "px";

        });

        document.addEventListener("mouseup", () => {

            isDragging = false;

            browserWindow.style.cursor = "default";

        });

    }

    /* ==========================
       Boot Start
    ========================== */

    bootSystem();

});
