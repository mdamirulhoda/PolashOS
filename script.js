document.addEventListener("DOMContentLoaded", () => {
    // 1. Boot Screen Handling (hides boot screen after 2.5 seconds)
    setTimeout(() => {
        const bootScreen = document.getElementById("boot-screen");
        const lockScreen = document.getElementById("lock-screen");
        
        if (bootScreen) bootScreen.style.display = "none";
        if (lockScreen) lockScreen.hidden = false;
    }, 2500);

    // 2. Lock Screen Unlock Handling
    const unlockBtn = document.getElementById("unlockBtn");
    const lockScreen = document.getElementById("lock-screen");
    const desktop = document.getElementById("desktop");

    if (unlockBtn) {
        unlockBtn.addEventListener("click", () => {
            if (lockScreen) lockScreen.hidden = true;
            // Desktop is main tag, ensure it's visible if hidden
            if (desktop) desktop.style.display = "block";
        });
    }

    // 3. Clock Update in System Tray
    function updateClock() {
        const clockSpan = document.getElementById("clock");
        if (clockSpan) {
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            hours = hours < 10 ? "0" + hours : hours;
            minutes = minutes < 10 ? "0" + minutes : minutes;
            clockSpan.textContent = `${hours}:${minutes}`;
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 4. Start Menu Toggle
    const startButton = document.getElementById("start-button");
    const startMenu = document.getElementById("start-menu");

    if (startButton && startMenu) {
        startButton.addEventListener("click", (e) => {
            e.stopPropagation();
            startMenu.hidden = !startMenu.hidden;
        });

        // Hide start menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
                startMenu.hidden = true;
            }
        });
    }

    // 5. Open Windows from Desktop Icons
    const appMapping = {
        "browserIcon": "browser-window",
        "filesIcon": "files-window",
        "terminalIcon": "terminal-window",
        "controlIcon": "control-window"
    };

    Object.keys(appMapping).forEach(iconId => {
        const icon = document.getElementById(iconId);
        const windowId = appMapping[iconId];
        const winElem = document.getElementById(windowId);

        if (icon && winElem) {
            icon.addEventListener("click", () => {
                winElem.hidden = false;
                // Bring to front or reset position if needed
            });
        }
    });

    // 6. Close Windows
    document.querySelectorAll(".window-close").forEach(closeBtn => {
        closeBtn.addEventListener("click", (e) => {
            const win = e.target.closest(".polash-window");
            if (win) {
                win.hidden = true;
            }
        });
    });
});
