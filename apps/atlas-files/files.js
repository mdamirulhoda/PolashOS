/* ==========================================
   Atlas Files Engine v1
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const filesGrid = document.getElementById("files-grid");
    const newFolderBtn = document.getElementById("new-folder-btn");
    const refreshBtn = document.getElementById("refresh-folder-btn");

    if (!filesGrid) return;

    let files = [
        { icon: "📂", name: "Documents" },
        { icon: "🖼", name: "Pictures" },
        { icon: "🎵", name: "Music" },
        { icon: "🎬", name: "Videos" },
        { icon: "⬇", name: "Downloads" },
        { icon: "📄", name: "README.txt" }
    ];

    function renderFiles() {

        filesGrid.innerHTML = "";

        files.forEach(file => {

            const item = document.createElement("div");

            item.className = "file-item";

            item.innerHTML = `
                <span>${file.icon}</span>
                <span>${file.name}</span>
            `;

            filesGrid.appendChild(item);

        });

    }

    renderFiles();

    /* ==========================
       New Folder
    ========================== */

    if (newFolderBtn) {

        newFolderBtn.addEventListener("click", () => {

            const folderName =
                `New Folder ${files.length}`;

            files.unshift({
                icon: "📁",
                name: folderName
            });

            renderFiles();

        });

    }

    /* ==========================
       Refresh
    ========================== */

    if (refreshBtn) {

        refreshBtn.addEventListener("click", () => {

            renderFiles();

        });

    }

});
