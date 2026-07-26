/* ==========================================
   PolashOS Window Manager v3
   Core Engine + Drag + Resize
   ========================================== */

class WindowManager {

    constructor() {

        this.windows = {};

        this.zIndex = 100;

    }


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



    open(id) {

        const win = this.windows[id];

        if (!win) return;


        win.hidden = false;

        win.style.display = "block";


        this.focus(id);

    }



    close(id) {

        const win = this.windows[id];

        if (!win) return;


        win.hidden = true;

    }



    toggle(id) {

        const win = this.windows[id];

        if (!win) return;


        if (win.hidden) {

            this.open(id);

        } else {

            this.close(id);

        }

    }



    focus(id) {

        const win = this.windows[id];

        if (!win) return;


        this.zIndex++;

        win.style.zIndex = this.zIndex;

    }




    /* ==========================================
       Window Controls
       ========================================== */


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





    /* ==========================================
       Drag System
       ========================================== */


    makeDraggable(element) {


        const bar =
        element.querySelector(".polash-titlebar");


        if (!bar) return;



        let offsetX = 0;

        let offsetY = 0;

        let dragging = false;



        bar.addEventListener("mousedown", (e) => {


            dragging = true;


            offsetX =
            e.clientX - element.offsetLeft;


            offsetY =
            e.clientY - element.offsetTop;



            this.focus(element.id);


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





    /* ==========================================
       Resize System
       ========================================== */


    makeResizable(element) {


        const handle =
        element.querySelector(".resize-handle");


        if (!handle) return;



        let resizing = false;

        let startX;

        let startY;

        let startWidth;

        let startHeight;




        handle.addEventListener("mousedown", (e) => {


            e.preventDefault();


            resizing = true;



            startX = e.clientX;

            startY = e.clientY;


            startWidth =
            element.offsetWidth;


            startHeight =
            element.offsetHeight;



        });





        document.addEventListener("mousemove", (e) => {


            if (!resizing) return;



            const newWidth =
            startWidth + (e.clientX - startX);



            const newHeight =
            startHeight + (e.clientY - startY);




            if (newWidth > 300) {

                element.style.width =
                `${newWidth}px`;

            }



            if (newHeight > 200) {

                element.style.height =
                `${newHeight}px`;

            }


        });





        document.addEventListener("mouseup", () => {


            resizing = false;


        });


    }



}



/* ==========================================
   Global Instance
   ========================================== */


const windowManager = new WindowManager();
