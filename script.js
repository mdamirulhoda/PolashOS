/* ==========================================
   PolashOS Core Script v2
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       Boot Screen
    ========================================== */

    const bootScreen = document.getElementById("boot-screen");
    const bootProgress = document.querySelector(".boot-progress");

    const lockScreen = document.getElementById("lock-screen");

    const unlockBtn = document.getElementById("unlockBtn");

    const desktop = document.getElementById("desktop");

    if (desktop) {

        desktop.style.display = "none";

    }

    if (lockScreen) {

        lockScreen.hidden = true;

    }

    if (bootProgress) {

        bootProgress.style.width = "100%";

    }

    setTimeout(() => {

        if (bootScreen) {

            bootScreen.style.display = "none";

        }

        if (lockScreen) {

            lockScreen.hidden = false;

        }

    },2500);

    /* ==========================================
       Unlock
    ========================================== */

    if (unlockBtn) {

        unlockBtn.addEventListener("click",()=>{

            lockScreen.hidden = true;

            desktop.style.display = "block";

        });

    }

    /* ==========================================
       Live Clock
    ========================================== */

    const clock = document.getElementById("clock");

    function updateClock(){

        const now = new Date();

        const h = String(now.getHours()).padStart(2,"0");

        const m = String(now.getMinutes()).padStart(2,"0");

        clock.textContent = `${h}:${m}`;

    }

    updateClock();

    setInterval(updateClock,1000);

                              /* ==========================================
       Start Menu
    ========================================== */

    const startButton = document.getElementById("start-button");

    const startMenu = document.getElementById("start-menu");

    if (startButton && startMenu) {

        startButton.addEventListener("click",(e)=>{

            e.stopPropagation();

            startMenu.hidden = !startMenu.hidden;

        });

        document.addEventListener("click",()=>{

            startMenu.hidden = true;

        });

    }

    /* ==========================================
       Desktop Icons
    ========================================== */

    const browserIcon = document.getElementById("browserIcon");

    const filesIcon = document.getElementById("filesIcon");

    const terminalIcon = document.getElementById("terminalIcon");

    const controlIcon = document.getElementById("controlIcon");

    if(browserIcon){

        browserIcon.addEventListener("dblclick",()=>{

            windowManager.open("browser-window");

        });

    }

    if(filesIcon){

        filesIcon.addEventListener("dblclick",()=>{

            windowManager.open("files-window");

        });

    }

    if(terminalIcon){

        terminalIcon.addEventListener("dblclick",()=>{

            windowManager.open("terminal-window");

        });

    }

    if(controlIcon){

        controlIcon.addEventListener("dblclick",()=>{

            windowManager.open("control-window");

        });

    }

    /* ==========================================
       Window Close Buttons
    ========================================== */

    document.querySelectorAll(".window-close").forEach(button=>{

        button.addEventListener("click",(e)=>{

            const win = e.target.closest(".window");

            if(win){

                windowManager.close(win.id);

            }

        });

    });

                              /* ==========================================
       Initialize Window Manager
    ========================================== */

    if (typeof windowManager !== "undefined") {

        windowManager.initialize();

    }

});
