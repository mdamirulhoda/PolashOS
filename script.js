/* ==========================================
   PolashOS Core Script v3 & Polaris Browser v7.3 (Final Full Code)
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const bootScreen = document.getElementById("boot-screen");
    const bootProgress = document.querySelector(".boot-progress");

    const lockScreen = document.getElementById("lock-screen");
    const unlockBtn = document.getElementById("unlockBtn");

    const desktop = document.getElementById("desktop");

    /* ==========================
       Initial State
    ========================== */

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

    /* ==========================
       Boot Animation
    ========================== */

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

    /* ==========================
       Unlock Desktop
    ========================== */

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

    /* ==========================
       Clock (Optimized to 1 Minute)
    ========================== */

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

    /* ==========================
       Start Menu
    ========================== */

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

    /* ==========================
       Desktop Icons (Cross-Platform: Touch/Click)
    ========================== */

    const appMapping = {
        browserIcon: "browser-window",
        filesIcon: "files-window",
        terminalIcon: "terminal-window",
        controlIcon: "control-window"
    };

    const openEvent =
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)
            ? "click"
            : "dblclick";

    Object.entries(appMapping).forEach(([elementId, windowId]) => {

        const icon = document.getElementById(elementId);

        if (!icon) return;

        icon.addEventListener(openEvent, (e) => {

            e.stopPropagation();

            if (window.windowManager) {
                if (typeof window.windowManager.toggle === "function") {
                    window.windowManager.toggle(windowId);
                } else if (typeof window.windowManager.open === "function") {
                    window.windowManager.open(windowId);
                }
            } else {
                console.warn("WindowManager not found globally!");
            }

        });

    });

    /* ==========================
       Initialize Window Manager
    ========================== */

    if (
        window.windowManager &&
        typeof window.windowManager.initialize === "function"
    ) {

        window.windowManager.initialize();

    }

    /* ==========================================
       Polaris Browser Navigation Engine v7.3
    ========================================== */

    const browserFrame = document.getElementById("browser-frame");
    const addressBar = document.getElementById("browser-address");

    const browserBack = document.getElementById("browser-back");
    const browserForward = document.getElementById("browser-forward");
    const browserRefresh = document.getElementById("browser-refresh");
    const browserHome = document.getElementById("browser-home");

    // History Engine (Future History Panel will use browserHistory)
    let browserHistory = JSON.parse(localStorage.getItem("polaris-history")) || [];

    function saveHistory(url) {
        if (!url || url === "about:blank") return;

        browserHistory.unshift(url);
        browserHistory = [...new Set(browserHistory)];

        localStorage.setItem(
            "polaris-history",
            JSON.stringify(browserHistory)
        );
    }

    const navigateBrowser = window.navigateBrowser = function(input) {
        let url = input.trim();

        if (!url) return;

        if (
            url.includes(".") &&
            !url.startsWith("http://") &&
            !url.startsWith("https://")
        ) {
            url = "https://" + url;
        }

        if (
            !url.startsWith("http://") &&
            !url.startsWith("https://")
        ) {
            url = "https://www.google.com/search?q=" + encodeURIComponent(input);
        }

        if (browserFrame) browserFrame.src = url;
        if (addressBar) addressBar.value = url;

        saveHistory(url);
    };

    /* Press Enter */
    if (addressBar) {
        addressBar.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                window.navigateBrowser(addressBar.value);
            }
        });
    }

    /* Home Button */
    if (browserHome) {
        browserHome.onclick = () => {
            if (browserFrame) browserFrame.src = "https://www.google.com";
            if (addressBar) addressBar.value = "https://www.google.com";
        };
    }

    /* Refresh Button */
    if (browserRefresh && browserFrame) {
        browserRefresh.onclick = () => {
            try {
                browserFrame.contentWindow.location.reload();
            } catch(e) {
                browserFrame.src = browserFrame.src;
            }
        };
    }

    /* Back Button */
    if (browserBack && browserFrame) {
        browserBack.onclick = () => {
            try {
                browserFrame.contentWindow.history.back();
            } catch(e) {}
        };
    }

    /* Forward Button */
    if (browserForward && browserFrame) {
        browserForward.onclick = () => {
            try {
                browserFrame.contentWindow.history.forward();
            } catch(e) {}
        };
    }

    /* ==========================================
       Polaris Browser Tabs v2
    ========================================== */

    const newTabBtn = document.getElementById("new-tab-btn");
    const browserTabs = document.querySelector(".browser-tabs");

    let tabCount = 1;

    if (newTabBtn && browserTabs) {
        newTabBtn.addEventListener("click", () => {
            tabCount++;

            const tab = document.createElement("div");
            tab.className = "browser-tab";
            tab.innerHTML = `🌐 Tab ${tabCount}`;

            browserTabs.insertBefore(tab, newTabBtn);

            document.querySelectorAll(".browser-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            if (browserFrame) browserFrame.src = "about:blank";
            if (addressBar) addressBar.value = "";

            tab.addEventListener("click", () => {
                document.querySelectorAll(".browser-tab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
            });
        });
    }

    /* ==========================================
       Polaris Browser Bookmarks Engine v4 (Ready for Custom Notification System)
    ========================================== */

    const bookmarkBtn = document.getElementById("browser-bookmark");
    let browserBookmarks = JSON.parse(localStorage.getItem("polaris-bookmarks")) || [];

    if (bookmarkBtn && browserFrame) {
        bookmarkBtn.addEventListener("click", () => {
            const url = browserFrame.src;

            if (!url || url === "about:blank") return;

            if (!browserBookmarks.includes(url)) {
                browserBookmarks.push(url);
                localStorage.setItem("polaris-bookmarks", JSON.stringify(browserBookmarks));
                
                // TODO: Replace with custom OS Notification System in future version
                console.log("⭐ Bookmark Saved");
            } else {
                // TODO: Replace with custom OS Notification System in future version
                console.log("⭐ Already Bookmarked");
            }
        });
    }

    /* ==========================================
       Polaris Browser Real Downloads Manager v7.3
    ========================================== */

    const downloadsBtn = document.getElementById("browser-downloads");
    const downloadsPanel = document.getElementById("downloads-panel");
    const downloadsList = document.getElementById("downloads-list");
    const clearDownloadsBtn = document.getElementById("clear-downloads");

    let downloadsData = JSON.parse(localStorage.getItem("polaris-downloads")) || [];

    function renderDownloads() {
        if (!downloadsList) return;

        if (downloadsData.length === 0) {
            downloadsList.innerHTML = `
                <p class="downloads-empty">
                    No downloads yet.
                </p>
            `;
            return;
        }

        downloadsList.innerHTML = "";
        downloadsData.forEach((item) => {
            const downloadItem = document.createElement("div");
            downloadItem.className = "download-item";
            downloadItem.innerHTML = `
                <div class="download-info">
                    <div class="download-name" title="${item.name}">${item.name}</div>
                    <div class="download-meta">${item.size || "Completed"}</div>
                </div>
                <div class="download-actions">
                    <a href="${item.url}" target="_blank" download class="download-btn">Open</a>
                </div>
            `;
            downloadsList.appendChild(downloadItem);
        });
    }

    window.addDownload = function(name, url, size = "2.4 MB") {
        downloadsData.unshift({ name, url, size });
        localStorage.setItem("polaris-downloads", JSON.stringify(downloadsData));
        renderDownloads();
    };

    if (downloadsBtn && downloadsPanel) {
        downloadsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            downloadsPanel.hidden = !downloadsPanel.hidden;
            renderDownloads();
        });

        document.addEventListener("click", (e) => {
            if (!downloadsPanel.contains(e.target) && !downloadsBtn.contains(e.target)) {
                downloadsPanel.hidden = true;
            }
        });
    }

    if (clearDownloadsBtn) {
        clearDownloadsBtn.addEventListener("click", () => {
            downloadsData = [];
            localStorage.removeItem("polaris-downloads");
            renderDownloads();
        });
    }

    // Initial render call
    renderDownloads();

});
   
