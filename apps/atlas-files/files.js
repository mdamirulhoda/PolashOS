/* ==========================================
   Atlas Files Engine v3.2 (Final Full Code with Safety Check)
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const filesGrid = document.getElementById("files-grid");
    const filesPath = document.querySelector(".files-path");
    const refreshBtn = document.getElementById("refresh-folder-btn");
    const newFolderBtn = document.getElementById("new-folder-btn");
    const filesBack = document.getElementById("files-back");

    if (!filesGrid) return;

    let fileSystem = JSON.parse(localStorage.getItem("atlas-filesystem")) || {
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

    function saveFileSystem() {
        localStorage.setItem("atlas-filesystem", JSON.stringify(fileSystem));
    }

    const openEvent =
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)
            ? "click"
            : "dblclick";

    function renderFolder() {
        filesGrid.innerHTML = "";
        if (filesPath) filesPath.textContent = currentFolder;

        if (!fileSystem[currentFolder]) return;

        fileSystem[currentFolder].forEach(item => {
            const div = document.createElement("div");
            div.className = "file-item";

            div.innerHTML = `
                <span>${item.type === "folder" ? "📁" : "📄"}</span>
                <span>${item.name}</span>
            `;

            if (item.type === "folder") {
                div.addEventListener(openEvent, () => {
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
        const count = fileSystem[currentFolder].filter(
            f => f.name && f.name.startsWith("New Folder")
        ).length + 1;
        const name = `New Folder ${count}`;

        if (!fileSystem[currentFolder]) {
            fileSystem[currentFolder] = [];
        }

        fileSystem[currentFolder].push({
            type: "folder",
            name
        });

        fileSystem[name] = [];
        saveFileSystem();
        renderFolder();
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

    /* ==========================
       Rename Folder / File
    ========================== */

    filesGrid.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        const item = e.target.closest(".file-item");
        if (!item) return;

        const oldName = item.querySelector("span:last-child").textContent;
        const newName = prompt("Rename", oldName);

        if (!newName || newName === oldName) return;

        const target = fileSystem[currentFolder].find(
            f => f.name === oldName
        );

        if (!target) return;

        target.name = newName;

        if (fileSystem[oldName]) {
            fileSystem[newName] = fileSystem[oldName];
            delete fileSystem[oldName];
        }

        saveFileSystem();
        renderFolder();
    });

});
                             
