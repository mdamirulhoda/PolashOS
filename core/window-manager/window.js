/* ==========================================
   PolashOS Window Manager v3
   Professional Window Engine
   ========================================== */


class WindowManager {


    constructor() {

        this.windows = {};

        this.zIndex = 100;

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


        this.windows[id] = element;


        this.setupControls(element, id);

        this.makeDraggable(element);

        this.makeResizable(element);


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


        this.zIndex++;


        win.style.zIndex = this.zIndex;


    }








    /* ==========================
       Window Controls
    ========================== */


    setupControls(element, id) {



        const closeBtn =
        element.querySelector(".window-close");


        const minimizeBtn =
        element.querySelector(".window-minimize");


        const maximizeBtn =
        element.querySelector(".window-maximize");





        if (closeBtn) {


            closeBtn.onclick = () => {


                this.close(id);


            };


        }






        if (minimizeBtn) {


            minimizeBtn.onclick = () => {


                element.style.display = "none";


            };


        }







        if (maximizeBtn) {


            maximizeBtn.onclick = () => {


                element.classList.toggle("maximized");


            };


        }


    }









    /* ==========================
       Drag System
    ========================== */


    makeDraggable(element) {



        const bar =
        element.querySelector(".window-titlebar");



        if (!bar) return;




        let dragging = false;

        let offsetX = 0;

        let offsetY = 0;






        bar.addEventListener("mousedown", (e) => {



            dragging = true;



            this.focus(
                element.id
            );



            offsetX =
            e.clientX - element.offsetLeft;



            offsetY =
            e.clientY - element.offsetTop;



        });






        document.addEventListener("mousemove", (e) => {



            if (!dragging) return;



            element.style.left =
            `${e.clientX - offsetX}px`;



            element.style.top =
            `${e.clientY - offsetY}px`;



        });







        document.addEventListener("mouseup", () => {


            dragging = false;


        });


    }









    /* ==========================
       Resize System
    ========================== */


    makeResizable(element) {



        const resizeHandle =
        document.createElement("div");



        resizeHandle.className =
        "resize-handle";



        element.appendChild(resizeHandle);





        let resizing = false;

        let startX;

        let startY;

        let startWidth;

        let startHeight;






        resizeHandle.addEventListener("mousedown", (e) => {



            resizing = true;



            startX = e.clientX;

            startY = e.clientY;



            startWidth =
            element.offsetWidth;



            startHeight =
            element.offsetHeight;



            e.stopPropagation();



        });







        document.addEventListener("mousemove", (e) => {



            if (!resizing) return;




            element.style.width =
            `${startWidth + (e.clientX - startX)}px`;



            element.style.height =
            `${startHeight + (e.clientY - startY)}px`;



        });







        document.addEventListener("mouseup", () => {



            resizing = false;



        });



    }



}






/* ==========================================
   Global Window Manager
   ========================================== */


const windowManager = new WindowManager();
