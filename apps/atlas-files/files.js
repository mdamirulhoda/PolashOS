/* ==========================================
   Atlas Files Engine v2
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const filesGrid = document.getElementById("files-grid");
    const filesPath = document.querySelector(".files-path");
    const refreshBtn = document.getElementById("refresh-folder-btn");
    const newFolderBtn = document.getElementById("new-folder-btn");

    if (!filesGrid) return;

    const fileSystem = {
        Home: [
            { type: "folder", name: "Desktop" },
            { type: "folder", name: "Documents" },
            { type: "folder", name: "Pictures" },
            { type: "folder", name: "Music" },
            { type: "folder", name: "Videos" },
            { type: "folder", name: "Downloads" },
            { type: "file", name: "README.txt" }
        ],

        Desktop: [],
        Documents: [],
        Pictures: [],
        Music: [],
        Videos: [],
        Downloads: []
    };

    let currentFolder = "Home";

    function renderFolder() {

        filesGrid.innerHTML = "";

        filesPath.textContent = currentFolder;

        fileSystem[currentFolder].forEach(item => {

            const div = document.createElement("div");

            div.className = "file-item";

            div.innerHTML = `
                <span>${item.type === "folder" ? "📁" : "📄"}</span>
                <span>${item.name}</span>
            `;

            if (item.type === "folder") {

                div.addEventListener("dblclick", () => {

                    currentFolder = item.name;
                    renderFolder();

                });

            }

            filesGrid.appendChild(div);

        });

    }

    renderFolder();

    refreshBtn?.addEventListener("click", renderFolder);

    newFolderBtn?.addEventListener("click", () => {

        const name = `New Folder ${Date.now()}`;

        fileSystem[currentFolder].push({
            type: "folder",
            name
        });

        fileSystem[name] = [];

        renderFolder();

    });

});
/* ==========================
   Sidebar Navigation
========================== */

document.querySelectorAll(".sidebar-menu li").forEach(item => {

    item.addEventListener("click", () => {

        const folder = item.textContent.replace(/^[^\w]+/, "").trim();

        if (fileSystem[folder]) {

            currentFolder = folder;

            document
                .querySelectorAll(".sidebar-menu li")
                .forEach(i => i.classList.remove("active"));

            item.classList.add("active");

            renderFolder();

        }

    });

});
/* ==========================
   Back Navigation
========================== */

const filesBack = document.getElementById("files-back");

if (filesBack) {

    filesBack.addEventListener("click", () => {

        if (currentFolder !== "Home") {

            currentFolder = "Home";

            document
                .querySelectorAll(".sidebar-menu li")
                .forEach(i => i.classList.remove("active"));

            const homeItem = document.querySelector(".sidebar-menu li");

            if (homeItem) homeItem.classList.add("active");

            renderFolder();

        }

    });

}
