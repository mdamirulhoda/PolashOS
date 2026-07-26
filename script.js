/* ==========================================
   PolashOS - Core Script v2
   Window Manager Integration
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
       Boot System
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
       Window Manager Setup
    ========================== */


    windowManager.register("browser-window");





    /* ==========================
       Polaris Browser
    ========================== */


    const browserIcon = document.getElementById("browserIcon");


    if (browserIcon) {


        browserIcon.addEventListener("dblclick", () => {


            windowManager.open("browser-window");


        });


    }





    /* ==========================
       Boot Start
    ========================== */


    bootSystem();



});
