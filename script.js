/* ==========================================================
   PolashOS Core + Atlas Files Engine
   PART 1 — Core / IndexedDB / VFS / Viewer
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    /* ==========================================================
       1. CORE DOM
    ========================================================== */

    const bootScreen = document.getElementById("boot-screen");
    const bootProgress = document.querySelector(".boot-progress");

    const lockScreen = document.getElementById("lock-screen");
    const unlockBtn = document.getElementById("unlockBtn");

    const desktop = document.getElementById("desktop");

    /* ==========================================================
       2. INITIAL STATE
    ========================================================== */

    if (desktop) {
        desktop.style.display = "none";
    }

    if (lockScreen) {
        lockScreen.hidden = true;
        lockScreen.style.display = "none";
    }

    if (bootProgress) {
        bootProgress.style.width = "100%";
    }

    /* ==========================================================
       3. BOOT SCREEN
    ========================================================== */

    setTimeout(() => {

        if (bootScreen) {

            bootScreen.style.opacity = "0";

            setTimeout(() => {
                bootScreen.style.display = "none";
            }, 700);
        }

        if (lockScreen) {
            lockScreen.hidden = false;
            lockScreen.style.display = "flex";
        }

    }, 2500);

    /* ==========================================================
       4. UNLOCK DESKTOP
    ========================================================== */

    if (unlockBtn) {

        unlockBtn.addEventListener("click", () => {

            if (lockScreen) {
                lockScreen.style.display = "none";
                lockScreen.hidden = true;
            }

            if (desktop) {
                desktop.style.display = "block";
            }

        });

    }

    /* ==========================================================
       5. CLOCK
    ========================================================== */

    const clock = document.getElementById("clock");

    function updateClock() {

        if (!clock) return;

        const now = new Date();

        const h = String(now.getHours()).padStart(2, "0");
        const m = String(now.getMinutes()).padStart(2, "0");

        clock.textContent = `${h}:${m}`;
    }

    updateClock();
    setInterval(updateClock, 60000);

    /* ==========================================================
       6. START MENU
    ========================================================== */

    const startButton = document.getElementById("start-button");
    const startMenu = document.getElementById("start-menu");

    if (startButton && startMenu) {

        startButton.addEventListener("click", (e) => {

            e.stopPropagation();

            startMenu.hidden = !startMenu.hidden;

        });

        document.addEventListener("click", (e) => {

            if (
                !startMenu.contains(e.target) &&
                !startButton.contains(e.target)
            ) {
                startMenu.hidden = true;
            }

        });

    }

    /* ==========================================================
       7. GLOBAL EVENT BUS
    ========================================================== */

    const EventBus = {

        listeners: {},

        on(event, callback) {

            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }

            this.listeners[event].push(callback);
        },

        emit(event, data) {

            if (!this.listeners[event]) return;

            this.listeners[event].forEach(callback => {

                try {
                    callback(data);
                } catch (error) {
                    console.error(
                        `EventBus error: ${event}`,
                        error
                    );
                }

            });

        }

    };

    window.PolashEventBus = EventBus;

    /* ==========================================================
       8. INDEXEDDB STORAGE MODULE
    ========================================================== */

    const StorageModule = {

        dbName: "AtlasOS_ProDB",
        storeName: "nodes",
        version: 1,
        db: null,

        async init() {

            return new Promise((resolve, reject) => {

                const request = indexedDB.open(
                    this.dbName,
                    this.version
                );

                request.onerror = () => {
                    reject(request.error);
                };

                request.onsuccess = () => {

                    this.db = request.result;

                    resolve(this.db);

                };

                request.onupgradeneeded = (event) => {

                    const db = event.target.result;

                    if (
                        !db.objectStoreNames.contains(
                            this.storeName
                        )
                    ) {

                        db.createObjectStore(
                            this.storeName,
                            {
                                keyPath: "id"
                            }
                        );

                    }

                };

            });

        },

        async saveNode(node) {

            if (!this.db || !node?.id) {
                return false;
            }

            return new Promise((resolve) => {

                const tx = this.db.transaction(
                    this.storeName,
                    "readwrite"
                );

                tx.objectStore(this.storeName).put(node);

                tx.oncomplete = () => {

                    EventBus.emit(
                        "fs:changed",
                        {
                            type: "save",
                            node
                        }
                    );

                    resolve(true);

                };

                tx.onerror = () => {
                    resolve(false);
                };

            });

        },

        async getNode(id) {

            if (!this.db || !id) {
                return null;
            }

            return new Promise((resolve) => {

                const tx = this.db.transaction(
                    this.storeName,
                    "readonly"
                );

                const request = tx
                    .objectStore(this.storeName)
                    .get(id);

                request.onsuccess = () => {

                    resolve(
                        request.result || null
                    );

                };

                request.onerror = () => {
                    resolve(null);
                };

            });

        },

        async deleteNode(id) {

            if (!this.db || !id) {
                return false;
            }

            return new Promise((resolve) => {

                const tx = this.db.transaction(
                    this.storeName,
                    "readwrite"
                );

                tx.objectStore(this.storeName).delete(id);

                tx.oncomplete = () => {

                    EventBus.emit(
                        "fs:changed",
                        {
                            type: "delete",
                            id
                        }
                    );

                    resolve(true);

                };

                tx.onerror = () => {
                    resolve(false);
                };

            });

        },

        async getAllNodes() {

            if (!this.db) {
                return [];
            }

            return new Promise((resolve) => {

                const tx = this.db.transaction(
                    this.storeName,
                    "readonly"
                );

                const request = tx
                    .objectStore(this.storeName)
                    .getAll();

                request.onsuccess = () => {

                    resolve(
                        request.result || []
                    );

                };

                request.onerror = () => {
                    resolve([]);
                };

            });

        }

    };

    try {

        await StorageModule.init();

    } catch (error) {

        console.error(
            "Atlas Storage initialization failed:",
            error
        );

        return;
    }

    window.StorageModule = StorageModule;

    /* ==========================================================
       9. VFS ROOT / SYSTEM FOLDERS
    ========================================================== */

    const rootId = "folder_root";
    const desktopFolderId = "folder_desktop";
    const documentsFolderId = "folder_docs";
    const recycleBinId = "folder_recycle_bin";

    async function seedSystem() {

        const root =
            await StorageModule.getNode(rootId);

        if (root) {
            return;
        }

        const now = Date.now();

        await StorageModule.saveNode({

            id: rootId,
            name: "Home",
            parentId: null,
            type: "folder",
            system: true,
            created: now,
            modified: now

        });

        await StorageModule.saveNode({

            id: desktopFolderId,
            name: "Desktop",
            parentId: rootId,
            type: "folder",
            system: true,
            created: now,
            modified: now

        });

        await StorageModule.saveNode({

            id: documentsFolderId,
            name: "Documents",
            parentId: rootId,
            type: "folder",
            system: true,
            created: now,
            modified: now

        });

        await StorageModule.saveNode({

            id: recycleBinId,
            name: "Recycle Bin",
            parentId: rootId,
            type: "folder",
            system: true,
            created: now,
            modified: now

        });

        await StorageModule.saveNode({

            id: "file_welcome",

            name: "Welcome.txt",

            parentId: documentsFolderId,

            type: "file",

            size: 0,

            content:
                "Welcome to PolashOS.\n\n" +
                "Atlas Files Engine is running successfully.",

            created: now,
            modified: now

        });

    }

    await seedSystem();

    /* ==========================================================
       10. VFS STATE
    ========================================================== */

    let currentFolderId = rootId;

    let selectedItemIds = new Set();

    let clipboard = {
        items: [],
        mode: null
    };

    window.AtlasVFS = {

        rootId,
        desktopFolderId,
        documentsFolderId,
        recycleBinId

    };

    /* ==========================================================
       11. VFS HELPERS
    ========================================================== */

    async function getChildren(folderId) {

        const all =
            await StorageModule.getAllNodes();

        return all.filter(
            node => node.parentId === folderId
        );

    }

    async function getFolderTrail(folderId) {

        const trail = [];

        let currentId = folderId;

        while (currentId) {

            const node =
                await StorageModule.getNode(
                    currentId
                );

            if (!node) {
                break;
            }

            trail.unshift(node);

            currentId = node.parentId;

        }

        return trail;

    }

    function generateId(type = "item") {

        return (
            `${type}_${Date.now()}_` +
            `${Math.random()
                .toString(36)
                .slice(2, 10)}`
        );

    }

    /* ==========================================================
       12. FILES UI
    ========================================================== */

    const filesGrid =
        document.getElementById("files-grid");

    const filesPath =
        document.querySelector(".files-path");

    const sidebarMenu =
        document.querySelector(".sidebar-menu");

    const contextMenu =
        document.getElementById(
            "files-context-menu"
        );

    /* ==========================================================
       13. SIDEBAR RENDER
    ========================================================== */

    async function renderSidebar() {

        if (!sidebarMenu) {
            return;
        }

        const root =
            await StorageModule.getNode(rootId);

        const desktopFolder =
            await StorageModule.getNode(
                desktopFolderId
            );

        const documents =
            await StorageModule.getNode(
                documentsFolderId
            );

        const recycleBin =
            await StorageModule.getNode(
                recycleBinId
            );

        sidebarMenu.innerHTML = `

            <li
                data-id="${root?.id || rootId}"
                class="${
                    currentFolderId === rootId
                        ? "active"
                        : ""
                }"
            >
                🏠 Home
            </li>

            <li
                data-id="${
                    desktopFolder?.id ||
                    desktopFolderId
                }"
                class="${
                    currentFolderId === desktopFolderId
                        ? "active"
                        : ""
                }"
            >
                💻 Desktop
            </li>

            <li
                data-id="${
                    documents?.id ||
                    documentsFolderId
                }"
                class="${
                    currentFolderId === documentsFolderId
                        ? "active"
                        : ""
                }"
            >
                📁 Documents
            </li>

            <li
                data-id="${
                    recycleBin?.id ||
                    recycleBinId
                }"
                class="${
                    currentFolderId === recycleBinId
                        ? "active"
                        : ""
                }"
            >
                🗑️ Recycle Bin
            </li>

        `;

    }

    /* ==========================================================
       14. FILE GRID RENDER
    ========================================================== */

    async function renderFolder() {

        if (!filesGrid) {
            return;
        }

        filesGrid.innerHTML = "";

        const children =
            await getChildren(
                currentFolderId
            );

        if (filesPath) {

            const trail =
                await getFolderTrail(
                    currentFolderId
                );

            filesPath.textContent =
                trail
                    .map(node => node.name)
                    .join(" > ");

        }

        const fragment =
            document.createDocumentFragment();

        children.forEach(item => {

            const div =
                document.createElement("div");

            div.className =
                "file-item" +
                (
                    selectedItemIds.has(item.id)
                        ? " selected"
                        : ""
                );

            div.dataset.id = item.id;

            div.draggable = true;

            const icon =
                item.type === "folder"
                    ? "📁"
                    : "📄";

            div.innerHTML = `

                <span class="file-icon">
                    ${icon}
                </span>

                <span
                    class="file-name-label"
                    title="${item.name}"
                >
                    ${item.name}
                </span>

            `;

            fragment.appendChild(div);

        });

        filesGrid.appendChild(fragment);

        await renderSidebar();

    }

    window.renderAtlasFolder =
        renderFolder;

    /* ==========================================================
       15. SIDEBAR CLICK
    ========================================================== */

    sidebarMenu?.addEventListener(
        "click",
        async (event) => {

            const item =
                event.target.closest(
                    "[data-id]"
                );

            if (!item) {
                return;
            }

            const id =
                item.dataset.id;

            const node =
                await StorageModule.getNode(id);

            if (!node) {
                return;
            }

            if (node.type !== "folder") {
                return;
            }

            currentFolderId = node.id;

            selectedItemIds.clear();

            await renderFolder();

        }
    );

    /* ==========================================================
       16. VIEWER MODULE
    ========================================================== */

    const ViewerModule = {

        openFile(item, saveCallback) {

            if (!item) {
                return;
            }

            const extension =
                item.name
                    .split(".")
                    .pop()
                    .toLowerCase();

            /* ---------- TEXT ---------- */

            if (
                [
                    "txt",
                    "md",
                    "json",
                    "js",
                    "css",
                    "html",
                    "htm"
                ].includes(extension)
            ) {

                const editorHTML = `

                    <div
                        style="
                            display:flex;
                            flex-direction:column;
                            height:100%;
                            gap:10px;
                        "
                    >

                        <textarea
                            id="atlas-editor"
                            spellcheck="false"
                            style="
                                flex:1;
                                width:100%;
                                box-sizing:border-box;
                                background:#1e1e1e;
                                color:#fff;
                                border:1px solid #444;
                                border-radius:6px;
                                padding:12px;
                                resize:none;
                                font-family:monospace;
                                font-size:13px;
                                outline:none;
                            "
                        ></textarea>

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                            "
                        >

                            <span
                                id="atlas-editor-size"
                                style="
                                    color:#aaa;
                                    font-size:11px;
                                "
                            >
                                Size: 0 bytes
                            </span>

                            <button
                                id="atl
                                /* ==========================================================
   ATLAS FILES ENGINE v18
   PART 2 — Clipboard / History / Recycle Bin /
   Context Menu / Keyboard / Drag & Drop
========================================================== */


/* ==========================================================
   20. HISTORY ENGINE
========================================================== */

const HistoryEngine = {

    undoStack: [],
    redoStack: [],

    execute(command) {

        if (!command || typeof command.execute !== "function") {
            return;
        }

        command.execute();

        this.undoStack.push(command);

        this.redoStack = [];

    },

    async undo() {

        if (!this.undoStack.length) {
            return;
        }

        const command =
            this.undoStack.pop();

        if (typeof command.undo === "function") {
            await command.undo();
        }

        this.redoStack.push(command);

        await renderFolder();

    },

    async redo() {

        if (!this.redoStack.length) {
            return;
        }

        const command =
            this.redoStack.pop();

        if (typeof command.execute === "function") {
            await command.execute();
        }

        this.undoStack.push(command);

        await renderFolder();

    },

    clear() {

        this.undoStack = [];
        this.redoStack = [];

    }

};

window.HistoryEngine =
    HistoryEngine;


/* ==========================================================
   21. COPY
========================================================== */

async function copySelected() {

    if (!selectedItemIds.size) {
        return;
    }

    clipboard.items =
        Array.from(selectedItemIds);

    clipboard.mode = "copy";

    console.log(
        "📋 Copied:",
        clipboard.items
    );

}


/* ==========================================================
   22. CUT
========================================================== */

async function cutSelected() {

    if (!selectedItemIds.size) {
        return;
    }

    clipboard.items =
        Array.from(selectedItemIds);

    clipboard.mode = "cut";

    console.log(
        "✂️ Cut:",
        clipboard.items
    );

}


/* ==========================================================
   23. CHECK FOLDER DESCENDANT
========================================================== */

async function isDescendant(
    possibleChildId,
    possibleParentId
) {

    let current =
        await StorageModule.getNode(
            possibleChildId
        );

    while (current) {

        if (
            current.parentId ===
            possibleParentId
        ) {
            return true;
        }

        if (!current.parentId) {
            break;
        }

        current =
            await StorageModule.getNode(
                current.parentId
            );

    }

    return false;

}


/* ==========================================================
   24. PASTE
========================================================== */

async function pasteClipboard() {

    if (!clipboard.items.length) {
        return;
    }

    const items =
        [...clipboard.items];

    const mode =
        clipboard.mode;

    const targetFolder =
        currentFolderId;

    for (const id of items) {

        const original =
            await StorageModule.getNode(id);

        if (!original) {
            continue;
        }


        /* ---------- Prevent same folder cut ---------- */

        if (
            mode === "cut" &&
            original.parentId === targetFolder
        ) {
            continue;
        }


        /* ---------- Prevent folder inside itself ---------- */

        if (
            original.type === "folder"
        ) {

            if (
                original.id ===
                targetFolder
            ) {
                continue;
            }

            if (
                await isDescendant(
                    targetFolder,
                    original.id
                )
            ) {
                continue;
            }

        }


        /* ==================================================
           COPY
        ================================================== */

        if (mode === "copy") {

            const newId =
                generateId(
                    original.type
                );

            const copy = {

                ...original,

                id: newId,

                parentId:
                    targetFolder,

                created:
                    Date.now(),

                modified:
                    Date.now(),

                system: false

            };

            await StorageModule.saveNode(
                copy
            );


            HistoryEngine.undoStack.push({

                async execute() {

                    await StorageModule.saveNode(
                        copy
                    );

                },

                async undo() {

                    await StorageModule.deleteNode(
                        copy.id
                    );

                }

            });

        }


        /* ==================================================
           CUT
        ================================================== */

        else if (mode === "cut") {

            const oldParent =
                original.parentId;

            original.parentId =
                targetFolder;

            original.modified =
                Date.now();

            await StorageModule.saveNode(
                original
            );


            HistoryEngine.undoStack.push({

                async execute() {

                    original.parentId =
                        targetFolder;

                    await StorageModule.saveNode(
                        original
                    );

                },

                async undo() {

                    original.parentId =
                        oldParent;

                    await StorageModule.saveNode(
                        original
                    );

                }

            });

        }

    }


    if (mode === "cut") {

        clipboard = {
            items: [],
            mode: null
        };

    }

    selectedItemIds.clear();

    await renderFolder();

}


/* ==========================================================
   25. MOVE TO RECYCLE BIN
========================================================== */

async function deleteSelected() {

    if (!selectedItemIds.size) {
        return;
    }

    if (
        currentFolderId ===
        recycleBinId
    ) {

        await permanentlyDeleteSelected();

        return;

    }


    const deleted = [];


    for (
        const id of selectedItemIds
    ) {

        const node =
            await StorageModule.getNode(id);

        if (
            !node ||
            node.system
        ) {
            continue;
        }

        const oldParent =
            node.parentId;

        node.originalParentId =
            oldParent;

        node.parentId =
            recycleBinId;

        node.deletedTime =
            Date.now();

        node.modified =
            Date.now();

        await StorageModule.saveNode(
            node
        );

        deleted.push({
            node,
            oldParent
        });

    }


    if (deleted.length) {

        HistoryEngine.undoStack.push({

            async execute() {

                for (
                    const entry of deleted
                ) {

                    entry.node.parentId =
                        recycleBinId;

                    await StorageModule.saveNode(
                        entry.node
                    );

                }

            },

            async undo() {

                for (
                    const entry of deleted
                ) {

                    entry.node.parentId =
                        entry.oldParent;

                    delete entry.node.originalParentId;
                    delete entry.node.deletedTime;

                    await StorageModule.saveNode(
                        entry.node
                    );

                }

            }

        });

    }

    selectedItemIds.clear();

    await renderFolder();

}


/* ==========================================================
   26. RESTORE
========================================================== */

async function restoreSelected() {

    if (
        currentFolderId !==
        recycleBinId
    ) {
        return;
    }


    for (
        const id of selectedItemIds
    ) {

        const node =
            await StorageModule.getNode(id);

        if (
            !node ||
            !node.originalParentId
        ) {
            continue;
        }


        let restoreParent =
            await StorageModule.getNode(
                node.originalParentId
            );


        /* Parent no longer exists */

        if (
            !restoreParent
        ) {

            node.parentId =
                rootId;

        } else {

            node.parentId =
                node.originalParentId;

        }


        delete node.originalParentId;

        delete node.deletedTime;

        node.modified =
            Date.now();

        await StorageModule.saveNode(
            node
        );

    }


    selectedItemIds.clear();

    await renderFolder();

}


/* ==========================================================
   27. PERMANENT DELETE
========================================================== */

async function permanentlyDeleteSelected() {

    if (!selectedItemIds.size) {
        return;
    }


    const confirmed =
        confirm(
            "Permanently delete selected item(s)?"
        );

    if (!confirmed) {
        return;
    }


    for (
        const id of selectedItemIds
    ) {

        const node =
            await StorageModule.getNode(id);

        if (
            !node ||
            node.system
        ) {
            continue;
        }

        await StorageModule.deleteNode(
            id
        );

    }


    selectedItemIds.clear();

    await renderFolder();

}


/* ==========================================================
   28. EMPTY RECYCLE BIN
========================================================== */

async function emptyRecycleBin() {

    if (
        currentFolderId !==
        recycleBinId
    ) {
        return;
    }


    const confirmed =
        confirm(
            "Empty Recycle Bin permanently?"
        );

    if (!confirmed) {
        return;
    }


    const items =
        await getChildren(
            recycleBinId
        );


    for (
        const item of items
    ) {

        if (!item.system) {

            await StorageModule.deleteNode(
                item.id
            );

        }

    }


    selectedItemIds.clear();

    await renderFolder();

}


/* ==========================================================
   29. DOWNLOAD FILES
========================================================== */

async function downloadSelected() {

    if (!selectedItemIds.size) {
        return;
    }


    for (
        const id of selectedItemIds
    ) {

        const item =
            await StorageModule.getNode(id);

        if (
            !item ||
            item.type !== "file"
        ) {
            continue;
        }


        const blob =
            new Blob(
                [
                    item.content || ""
                ],
                {
                    type:
                        "application/octet-stream"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            item.name;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();


        setTimeout(() => {

            URL.revokeObjectURL(
                url
            );

        }, 1000);

    }

}


/* ==========================================================
   30. OPEN SELECTED
========================================================== */

async function openSelected() {

    if (
        selectedItemIds.size !== 1
    ) {
        return;
    }


    const id =
        Array.from(
            selectedItemIds
        )[0];


    const item =
        await StorageModule.getNode(
            id
        );

    if (!item) {
        return;
    }


    if (
        item.type === "folder"
    ) {

        currentFolderId =
            item.id;

        selectedItemIds.clear();

        await renderFolder();

    }

    else {

        ViewerModule.openFile(
            item,
            renderFolder
        );

    }

}


/* ==========================================================
   31. CONTEXT MENU
========================================================== */

function hideContextMenu() {

    if (!contextMenu) {
        return;
    }

    contextMenu.style.display =
        "none";

}


filesGrid?.addEventListener(
    "contextmenu",
    async (event) => {

        event.preventDefault();

        const itemElement =
            event.target.closest(
                ".file-item"
            );


        if (itemElement) {

            const id =
                itemElement.dataset.id;

            if (
                !selectedItemIds.has(id)
            ) {

                selectedItemIds.clear();

                selectedItemIds.add(id);

                await renderFolder();

            }

        }


        if (!contextMenu) {
            return;
        }


        contextMenu.style.display =
            "block";

        contextMenu.style.position =
            "fixed";

        contextMenu.style.left =
            `${event.clientX}px`;

        contextMenu.style.top =
            `${event.clientY}px`;

        contextMenu.style.zIndex =
            "999999";

    }
);


/* ==========================================================
   32. CONTEXT MENU ACTIONS
========================================================== */

contextMenu?.addEventListener(
    "click",
    async (event) => {

        const actionElement =
            event.target.closest(
                "[data-action]"
            );

        if (!actionElement) {
            return;
        }


        const action =
            actionElement.dataset.action;


        hideContextMenu();


        switch (action) {

            case "open":

                await openSelected();

                break;


            case "copy":

                await copySelected();

                break;


            case "cut":

                await cutSelected();

                break;


            case "paste":

                await pasteClipboard();

                break;


            case "delete":

                await deleteSelected();

                break;


            case "restore":

                await restoreSelected();

                break;


            case "empty-bin":

                await emptyRecycleBin();

                break;


            case "download":

                await downloadSelected();

                break;


            case "undo":

                await HistoryEngine.undo();

                break;


            case "redo":

                await HistoryEngine.redo();

                break;

        }

    }
);


/* ==========================================================
   33. FILE SELECTION
========================================================== */

filesGrid?.addEventListener(
    "click",
    async (event) => {

        const itemElement =
            event.target.closest(
                ".file-item"
            );

        if (!itemElement) {

            selectedItemIds.clear();

            await renderFolder();

            return;

        }


        const id =
            itemElement.dataset.id;


        if (
            event.ctrlKey ||
            event.metaKey
        ) {

            if (
                selectedItemIds.has(id)
            ) {

                selectedItemIds.delete(id);

            } else {

                selectedItemIds.add(id);

            }

        }

        else {

            selectedItemIds.clear();

            selectedItemIds.add(id);

        }


        await renderFolder();

    }
);


/* ==========================================================
   34. DOUBLE CLICK OPEN
========================================================== */

filesGrid?.addEventListener(
    "dblclick",
    async (event) => {

        const itemElement =
            event.target.closest(
                ".file-item"
            );

        if (!itemElement) {
            return;
        }


        const id =
            itemElement.dataset.id;


        selectedItemIds.clear();

        selectedItemIds.add(id);


        await openSelected();

    }
);


/* ==========================================================
   35. KEYBOARD SHORTCUTS
========================================================== */

document.addEventListener(
    "keydown",
    async (event) => {

        const target =
            event.target;


        if (
            target &&
            (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            )
        ) {
            return;
        }


        const modifier =
            event.ctrlKey ||
            event.metaKey;


        /* ---------- COPY ---------- */

        if (
            modifier &&
            event.key.toLowerCase() === "c"
        ) {

            event.preventDefault();

            await copySelected();

            return;

        }


        /* ---------- CUT ---------- */

        if (
            modifier &&
            event.key.toLowerCase() === "x"
        ) {

            event.preventDefault();

            await cutSelected();

            return;

        }


        /* ---------- PASTE ---------- */

        if (
            modifier &&
            event.key.toLowerCase() === "v"
        ) {

            event.preventDefault();

            await pasteClipboard();

            return;

        }


        /* ---------- UNDO ---------- */

        if (
            modifier &&
            event.key.toLowerCase() === "z"
        ) {

            event.preventDefault();

            await HistoryEngine.undo();

            return;

        }


        /* ---------- REDO ---------- */

        if (
            modifier &&
            (
                event.key.toLowerCase() === "y" ||
                (
                    event.shiftKey &&
                    event.key.toLowerCase() === "z"
                )
            )
        ) {

            event.preventDefault();

            await HistoryEngine.redo();

            return;

        }


        /* ---------- DELETE ---------- */

        if (
            event.key === "Delete" ||
            event.key === "Backspace"
        ) {

            event.preventDefault();

            await deleteSelected();

            return;

        }


        /* ---------- ENTER ---------- */

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            await openSelected();

            return;

        }


        /* ---------- ESCAPE ---------- */

        if (
            event.key === "Escape"
        ) {

            selectedItemIds.clear();

            hideContextMenu();

            await renderFolder();

            return;

        }

    }
);


/* ==========================================================
   36. DRAG START
========================================================== */

filesGrid?.addEventListener(
    "dragstart",
    (event) => {

        const itemElement =
            event.target.
            /* ==========================================================
   ATLAS FILES ENGINE v18
   PART 3 — REAL FILE VIEWER
   TXT / MD / JSON / JS / HTML / CSS
   IMAGE / VIDEO / AUDIO
========================================================== */


/* ==========================================================
   43. VIEWER MODULE
========================================================== */

const ViewerModule = {

    openFile(item, renderCallback) {

        if (!item || !item.name) {
            return;
        }

        const extension =
            item.name
                .split(".")
                .pop()
                .toLowerCase();


        /* ==================================================
           TEXT / CODE FILES
        ================================================== */

        if (
            [
                "txt",
                "md",
                "json",
                "js",
                "css",
                "html",
                "htm",
                "xml",
                "csv"
            ].includes(extension)
        ) {

            this.openTextEditor(
                item,
                renderCallback
            );

            return;

        }


        /* ==================================================
           IMAGE FILES
        ================================================== */

        if (
            [
                "png",
                "jpg",
                "jpeg",
                "gif",
                "webp",
                "svg",
                "bmp"
            ].includes(extension)
        ) {

            this.openImageViewer(item);

            return;

        }


        /* ==================================================
           VIDEO FILES
        ================================================== */

        if (
            [
                "mp4",
                "webm",
                "ogg",
                "mov"
            ].includes(extension)
        ) {

            this.openVideoViewer(item);

            return;

        }


        /* ==================================================
           AUDIO FILES
        ================================================== */

        if (
            [
                "mp3",
                "wav",
                "ogg",
                "m4a",
                "aac"
            ].includes(extension)
        ) {

            this.openAudioViewer(item);

            return;

        }


        /* ==================================================
           UNSUPPORTED
        ================================================== */

        alert(
            `Atlas Files cannot preview "${item.name}".`
        );

    },


    /* ======================================================
       TEXT EDITOR
    ====================================================== */

    openTextEditor(item, renderCallback) {

        const safeContent =
            escapeHTML(
                item.content || ""
            );


        const editorHTML = `

            <div class="atlas-editor">

                <div class="atlas-editor-toolbar">

                    <span class="atlas-editor-title">
                        📄 ${escapeHTML(item.name)}
                    </span>

                    <span
                        id="atlas-editor-size"
                        class="atlas-editor-size"
                    >
                        ${formatBytes(
                            new Blob([
                                item.content || ""
                            ]).size
                        )}
                    </span>

                    <button
                        id="atlas-editor-save"
                        class="atlas-editor-btn"
                    >
                        💾 Save
                    </button>

                </div>


                <textarea
                    id="atlas-editor-textarea"
                    class="atlas-editor-textarea"
                    spellcheck="false"
                >${safeContent}</textarea>


                <div class="atlas-editor-footer">

                    <span>
                        Ctrl + S to save
                    </span>

                    <span
                        id="atlas-editor-status"
                    >
                        Ready
                    </span>

                </div>

            </div>

        `;


        const win =
            WindowManager.open({

                id:
                    `atlas_editor_${item.id}`,

                title:
                    `📄 ${item.name}`,

                contentHTML:
                    editorHTML,

                width:
                    760,

                height:
                    560

            });


        if (!win) {
            return;
        }


        const textarea =
            win.querySelector(
                "#atlas-editor-textarea"
            );

        const saveButton =
            win.querySelector(
                "#atlas-editor-save"
            );

        const sizeLabel =
            win.querySelector(
                "#atlas-editor-size"
            );

        const statusLabel =
            win.querySelector(
                "#atlas-editor-status"
            );


        if (!textarea) {
            return;
        }


        /* ==================================================
           UPDATE SIZE
        ================================================== */

        textarea.addEventListener(
            "input",
            () => {

                const size =
                    new Blob([
                        textarea.value
                    ]).size;

                if (sizeLabel) {

                    sizeLabel.textContent =
                        formatBytes(size);

                }

                if (statusLabel) {

                    statusLabel.textContent =
                        "Unsaved changes";

                }

            }
        );


        /* ==================================================
           SAVE
        ================================================== */

        const saveFile =
            async () => {

                item.content =
                    textarea.value;

                item.size =
                    new Blob([
                        item.content
                    ]).size;

                item.modified =
                    Date.now();


                const saved =
                    await StorageModule.saveNode(
                        item
                    );


                if (saved) {

                    if (statusLabel) {

                        statusLabel.textContent =
                            "✓ Saved";

                    }

                    if (
                        typeof renderCallback ===
                        "function"
                    ) {

                        await renderCallback();

                    }

                } else {

                    if (statusLabel) {

                        statusLabel.textContent =
                            "Save failed";

                    }

                }

            };


        saveButton?.addEventListener(
            "click",
            saveFile
        );


        /* ==================================================
           CTRL + S
        ================================================== */

        textarea.addEventListener(
            "keydown",
            async event => {

                if (
                    (event.ctrlKey ||
                     event.metaKey) &&
                    event.key.toLowerCase() === "s"
                ) {

                    event.preventDefault();

                    await saveFile();

                }

            }
        );


        textarea.focus();

    },


    /* ======================================================
       IMAGE VIEWER
    ====================================================== */

    openImageViewer(item) {

        const html = `

            <div class="atlas-image-viewer">

                <div
                    class="atlas-image-stage"
                    id="atlas-image-stage"
                >

                    <img
                        id="atlas-image"
                        src="${item.content || ""}"
                        alt="${escapeHTML(item.name)}"
                        draggable="false"
                    >

                </div>


                <div class="atlas-media-toolbar">

                    <button id="atlas-img-minus">
                        −
                    </button>

                    <span id="atlas-img-zoom">
                        100%
                    </span>

                    <button id="atlas-img-plus">
                        +
                    </button>

                    <button id="atlas-img-rotate">
                        ↻ Rotate
                    </button>

                    <button id="atlas-img-reset">
                        Reset
                    </button>

                </div>

            </div>

        `;


        const win =
            WindowManager.open({

                id:
                    `atlas_image_${item.id}`,

                title:
                    `🖼️ ${item.name}`,

                contentHTML:
                    html,

                width:
                    760,

                height:
                    560

            });


        const image =
            win?.querySelector(
                "#atlas-image"
            );

        if (!image) {
            return;
        }


        let zoom = 1;

        let rotation = 0;


        const updateImage =
            () => {

                image.style.transform =
                    `
                    scale(${zoom})
                    rotate(${rotation}deg)
                    `;

                const label =
                    win.querySelector(
                        "#atlas-img-zoom"
                    );

                if (label) {

                    label.textContent =
                        `${Math.round(
                            zoom * 100
                        )}%`;

                }

            };


        win.querySelector(
            "#atlas-img-plus"
        )?.addEventListener(
            "click",
            () => {

                zoom =
                    Math.min(
                        zoom + 0.25,
                        5
                    );

                updateImage();

            }
        );


        win.querySelector(
            "#atlas-img-minus"
        )?.addEventListener(
            "click",
            () => {

                zoom =
                    Math.max(
                        zoom - 0.25,
                        0.25
                    );

                updateImage();

            }
        );


        win.querySelector(
            "#atlas-img-rotate"
        )?.addEventListener(
            "click",
            () => {

                rotation =
                    (rotation + 90) % 360;

                updateImage();

            }
        );


        win.querySelector(
            "#atlas-img-reset"
        )?.addEventListener(
            "click",
            () => {

                zoom = 1;

                rotation = 0;

                updateImage();

            }
        );


        const stage =
            win.querySelector(
                "#atlas-image-stage"
            );


        stage?.addEventListener(
            "wheel",
            event => {

                event.preventDefault();

                if (
                    event.deltaY < 0
                ) {

                    zoom =
                        Math.min(
                            zoom + 0.1,
                            5
                        );

                } else {

                    zoom =
                        Math.max(
                            zoom - 0.1,
                            0.25
                        );

                }

                updateImage();

            },
            {
                passive: false
            }
        );

    },


    /* ======================================================
       VIDEO VIEWER
    ====================================================== */

    openVideoViewer(item) {

        const html = `

            <div class="atlas-video-viewer">

                <video
                    controls
                    autoplay
                    style="
                        width:100%;
                        height:100%;
                        max-height:100%;
                        object-fit:contain;
                        background:#000;
                    "
                >

                    <source
                        src="${item.content || ""}"
                    >

                    Your browser does not support
                    video playback.

                </video>

            </div>

        `;


        WindowManager.open({

            id:
                `atlas_video_${item.id}`,

            title:
                `🎬 ${item.name}`,

            contentHTML:
                html,

            width:
                820,

            height:
                560

        });

    },


    /* ======================================================
       AUDIO VIEWER
    ====================================================== */

    openAudioViewer(item) {

        const html = `

            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    height:100%;
                    flex-direction:column;
                    gap:25px;
                    background:#111;
                    color:#fff;
                "
            >

                <div style="font-size:70px;">
                    🎵
                </div>

                <strong>
                    ${escapeHTML(item.name)}
                </strong>

                <audio
                    controls
                    autoplay
                    style="width:90%;"
                >

                    <source
                        src="${item.content || ""}"
                    >

                    Your browser does not support
                    audio playback.

                </audio>

            </div>

        `;


        WindowManager.open({

            id:
                `atlas_audio_${item.id}`,

            title:
                `🎵 ${item.name}`,

            contentHTML:
                html,

            width:
                600,

            height:
                350

        });

    }

};


/* ==========================================================
   44. UTILITY — HTML ESCAPE
========================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================================
   45. FORMAT FILE SIZE
========================================================== */

function formatBytes(bytes) {

    if (!bytes || bytes <= 0) {
        return "0 B";
    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const safeIndex =
        Math.min(
            index,
            units.length - 1
        );


    return (
        `${(
            bytes /
            Math.pow(
                1024,
                safeIndex
            )
        ).toFixed(
            safeIndex === 0 ? 0 : 2
        )} ${units[safeIndex]}`
    );

}


/* ==========================================================
   46. GLOBAL VIEWER API
========================================================== */

window.ViewerModule =
    ViewerModule;


/* ==========================================================
   47. FINAL INITIALIZATION
========================================================== */

console.log(
    "✅ Atlas Files Viewer v18 loaded."
);


/* ==========================================================
   END OF DOMContentLoaded
========================================================== */

});
                                
