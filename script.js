/* ==========================================================
   PolashOS Core + Atlas Files Engine (Fully Fixed & Optimized)
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
       3. SAFE STORAGE & SYSTEM INITIALIZATION (With Fallback)
    ========================================================== */

    try {
        if (typeof StorageModule !== 'undefined' && StorageModule.init) {
            await StorageModule.init();
        }
        if (typeof seedSystem === 'function') {
            await seedSystem();
        }
    } catch (error) {
        console.error("Initialization warning, proceeding with fallback:", error);
    }

    /* ==========================================================
       4. GUARANTEED BOOT TO LOCK SCREEN TRANSITION
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
       5. UNLOCK DESKTOP
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

            if (typeof renderFolder === 'function') {
                renderFolder();
            }

        });

    }

    /* ==========================================================
       6. CLOCK
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
       7. START MENU
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
       8. GLOBAL EVENT BUS
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
       9. INDEXEDDB STORAGE MODULE
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

    }

    window.StorageModule = StorageModule;

    /* ==========================================================
       10. VFS ROOT / SYSTEM FOLDERS
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

    try {
        await seedSystem();
    } catch (e) {
        console.error("Seed system error:", e);
    }

    /* ==========================================================
       11. VFS STATE
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
       12. VFS HELPERS
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


           
