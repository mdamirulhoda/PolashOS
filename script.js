/* ==========================================
   PolashOS Core Script v3
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const bootScreen = document.getElementById("boot-screen");
    const bootProgress = document.querySelector(".boot-progress");

    const lockScreen = document.getElementById("lock-screen");
    const unlockBtn = document.getElementById("unlockBtn");

    const desktop = document.getElementById("desktop");

    /* ==========================
       Initial State
    ========================== */

    if (desktop) {
        desktop.style.display = "none";
    }

    if (lockScreen) {
        lockScreen.hidden = true;
        lockScreen.style.display = "none";
    }

    if (bootProgress) {
        bootProgress.style.width = "100%";
    }

    /* ==========================
       Boot Animation
    ========================== */

    setTimeout(() => {

        if (bootScreen) {

            bootScreen.style.opacity = "0";

            setTimeout(() => {

                bootScreen.style.display = "none";

            }, 700);

        }

        if (lockScreen) {

            lockScreen.hidden = false;
            lockScreen.style.display = "flex";

        }

    }, 2500);

    /* ==========================
       Unlock Desktop
    ========================== */

    if (unlockBtn) {

        unlockBtn.addEventListener("click", () => {

            if (lockScreen) {

                lockScreen.style.display = "none";
                lockScreen.hidden = true;

            }

            if (desktop) {

                desktop.style.display = "block";

            }

        });

    }

    /* ==========================
       Clock
    ========================== */

    const clock = document.getElementById("clock");

    function updateClock() {

        if (!clock) return;

        const now = new Date();

        const h = String(now.getHours()).padStart(2, "0");
        const m = String(now.getMinutes()).padStart(2, "0");

        clock.textContent = `${h}:${m}`;

    }

    updateClock();

    setInterval(updateClock, 1000);

    /* ==========================
       Start Menu
    ========================== */

    const startButton = document.getElementById("start-button");
    const startMenu = document.getElementById("start-menu");

    if (startButton && startMenu) {

        startButton.addEventListener("click", (e) => {

            e.stopPropagation();

            startMenu.hidden = !startMenu.hidden;

        });

        document.addEventListener("click", (e) => {

            if (
                !startMenu.contains(e.target) &&
                !startButton.contains(e.target)
            ) {

                startMenu.hidden = true;

            }

        });

    }

    /* ==========================
       Desktop Icons
    ========================== */

    const appMapping = {
        browserIcon: "browser-window",
        filesIcon: "files-window",
        terminalIcon: "terminal-window",
        controlIcon: "control-window"
    };

    Object.entries(appMapping).forEach(([elementId, windowId]) => {

        const icon = document.getElementById(elementId);

        if (!icon) return;

        const launchApp = () => {

            if (
                window.windowManager &&
                typeof window.windowManager.open === "function"
            ) {

                window.windowManager.open(windowId);

            }

        };

        icon.addEventListener("click", launchApp);
        icon.addEventListener("dblclick", launchApp);

    });

    /* ==========================
       Initialize Window Manager
    ========================== */

    if (
        window.windowManager &&
        typeof window.windowManager.initialize === "function"
    ) {

        window.windowManager.initialize();

    }

});
