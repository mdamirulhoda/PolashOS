/* ==========================================
   PolashOS - Core Script v5
   Mobile Single Click Working Version
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


    function bootSystem(){

        if(bootProgress){

            bootProgress.style.width = "100%";

        }


        setTimeout(()=>{


            bootScreen.style.opacity = "0";


            setTimeout(()=>{


                bootScreen.style.display = "none";

                lockScreen.hidden = false;


            },800);



        },2500);


    }





    /* ==========================
       Unlock Desktop
    ========================== */


    unlockBtn.addEventListener("click",()=>{


        lockScreen.style.display="none";

        desktop.style.display="block";


    });







    /* ==========================
       Start Menu
    ========================== */


    startButton.addEventListener("click",()=>{


        startMenu.hidden = !startMenu.hidden;


    });







    /* ==========================
       Clock
    ========================== */


    function updateClock(){


        const now = new Date();


        const hours =
        String(now.getHours()).padStart(2,"0");


        const minutes =
        String(now.getMinutes()).padStart(2,"0");


        clock.textContent =
        `${hours}:${minutes}`;


    }


    updateClock();

    setInterval(updateClock,1000);







    /* ==========================
       App Windows
       Mobile Single Click
    ========================== */


    const apps = [


        {
            icon:"browserIcon",
            window:"browser-window"
        },


        {
            icon:"filesIcon",
            window:"files-window"
        },


        {
            icon:"terminalIcon",
            window:"terminal-window"
        },


        {
            icon:"controlIcon",
            window:"control-window"
        }


    ];





    apps.forEach(app=>{


        const icon =
        document.getElementById(app.icon);


        const appWindow =
        document.getElementById(app.window);



        if(icon && appWindow){


            icon.addEventListener("click",()=>{


                appWindow.hidden=false;


            });


        }


    });







    /* ==========================
       Close Windows
    ========================== */


    document.querySelectorAll(".window-close")
    .forEach(button=>{


        button.addEventListener("click",()=>{


            const windowBox =
            button.closest(".polash-window");


            if(windowBox){

                windowBox.hidden=true;

            }


        });


    });







    /* ==========================
       Start Boot
    ========================== */


    bootSystem();



});
