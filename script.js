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
