/* ==========================================
   Atlas Files Engine v4.5 (Final Full Code with Confirmation Stubs)
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
       Context Menu Setup
    ========================== */

    const contextMenu = document.getElementById("files-context-menu");
    const renameItem = document.getElementById("rename-item");
    const deleteItem = document.getElementById("delete-item");

    let selectedItem = null;

    filesGrid.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        const target = e.target.closest(".file-item");
        if (!target || !contextMenu) return;

        selectedItem = target;

        contextMenu.hidden = false;
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
    });

    document.addEventListener("click", () => {
        if (contextMenu) {
            contextMenu.hidden = true;
            selectedItem = null;
        }
    });

    /* ==========================
       Rename Action
    ========================== */

    renameItem?.addEventListener("click", () => {
        if (!selectedItem) return;

        const oldName = selectedItem.querySelector("span:last-child").textContent;
        const newName = prompt("Rename", oldName);

        if (!newName || newName === oldName) return;

        // Duplicate Name Check
        if (fileSystem[currentFolder].some(f => f.name === newName)) {
            // TODO: Replace with PolashOS Notification System -> showNotification("Name already exists.");
            alert("Name already exists.");
            return;
        }

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

        selectedItem = null;
        if (contextMenu) contextMenu.hidden = true;
    });

    /* ==========================
       Delete Action
    ========================== */

    deleteItem?.addEventListener("click", () => {
        if (!selectedItem) return;

        const itemName = selectedItem.querySelector("span:last-child").textContent;

        /* 
           TODO: Replace with PolashOS Custom Confirmation Dialog in future:
           Delete "itemName" ?
           [Delete] [Cancel]
        */

        fileSystem[currentFolder] = fileSystem[currentFolder].filter(
            item => item.name !== itemName
        );

        if (fileSystem[itemName]) {
            delete fileSystem[itemName];
        }

        saveFileSystem();
        renderFolder();

        selectedItem = null;
        if (contextMenu) contextMenu.hidden = true;
    });

});
       
