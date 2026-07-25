document.addEventListener("DOMContentLoaded", () => {

    const button = document.getElementById("launchBtn");

    button.addEventListener("click", () => {

        button.innerText = "Initializing Polaris Engine...";

        button.disabled = true;

        setTimeout(() => {

            button.innerText = "Boot Experience Coming Soon 🚀";

        }, 1800);

    });

});


// ===========================
// Boot Screen Animation
// ===========================

window.addEventListener("load", () => {

    const progress = document.querySelector(".boot-progress");
    const bootScreen = document.getElementById("boot-screen");

    if (!progress || !bootScreen) return;

    // Start loading bar
    progress.style.width = "100%";

    // Hide boot screen after loading
    setTimeout(() => {

        bootScreen.style.opacity = "0";

        setTimeout(() => {
            bootScreen.style.display = "none";
        }, 800);

    }, 2500);

});
