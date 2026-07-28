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

        icon.addEventListener("click", (e) => {

            e.stopPropagation();

            if (window.windowManager) {
                if (typeof window.windowManager.toggle === "function") {
                    window.windowManager.toggle(windowId);
                } else if (typeof window.windowManager.open === "function") {
                    window.windowManager.open(windowId);
                }
            } else {
                console.warn("WindowManager not found globally!");
            }

        });

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

/* ==========================================
   Polaris Browser Engine v1
========================================== */

const browserFrame = document.getElementById("browser-frame");
const browserAddress = document.getElementById("browser-address");

const browserBack = document.getElementById("browser-back");
const browserForward = document.getElementById("browser-forward");
const browserRefresh = document.getElementById("browser-refresh");
const browserHome = document.getElementById("browser-home");

function openAddress(value){

    if(!value) return;

    value = value.trim();

    if(
        value.startsWith("http://") ||
        value.startsWith("https://")
    ){

        browserFrame.src = value;

    }else if(value.includes(".")){

        browserFrame.src = "https://" + value;

    }else{

        browserFrame.src =
        "https://www.google.com/search?q=" +
        encodeURIComponent(value);

    }

}

if(browserAddress){

    browserAddress.addEventListener("keydown",(e)=>{

        if(e.key==="Enter"){

            openAddress(browserAddress.value);

        }

    });

}

if(browserHome){

    browserHome.onclick=()=>{

        browserFrame.src="about:blank";

        browserAddress.value="";

    };

}

if(browserRefresh){

    browserRefresh.onclick=()=>{

        browserFrame.contentWindow.location.reload();

    };

}

if(browserBack){

    browserBack.onclick=()=>{

        browserFrame.contentWindow.history.back();

    };

}

if(browserForward){

    browserForward.onclick=()=>{

        browserFrame.contentWindow.history.forward();

    };

}

/* ==========================================
   Polaris Browser Tabs v2
========================================== */

const newTabBtn = document.getElementById("new-tab-btn");
const browserTabs = document.querySelector(".browser-tabs");

let tabCount = 1;

if (newTabBtn) {

    newTabBtn.addEventListener("click", () => {

        tabCount++;

        const tab = document.createElement("div");

        tab.className = "browser-tab";

        tab.innerHTML = `🌐 Tab ${tabCount}`;

        browserTabs.insertBefore(tab, newTabBtn);

        document
            .querySelectorAll(".browser-tab")
            .forEach(t => t.classList.remove("active"));

        tab.classList.add("active");

        browserFrame.src = "about:blank";
        browserAddress.value = "";

        tab.addEventListener("click", () => {

            document
                .querySelectorAll(".browser-tab")
                .forEach(t => t.classList.remove("active"));

            tab.classList.add("active");

        });

    });

}
