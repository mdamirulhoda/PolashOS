class TaskbarModule {
    constructor(windowManagerInstance) {
        this.wm = windowManagerInstance;
        this.taskbarAppsContainer = document.getElementById('taskbar-apps');
        this.taskbarButtons = new Map();
        this.intervalId = null;

        this.init();
    }

    init() {
        if (!this.taskbarAppsContainer) return;
        this.syncExistingWindows();
        this.startPollSync();
    }

    syncExistingWindows() {
        if (!this.wm || !this.wm.windows) return;

        this.wm.windows.forEach((record, id) => {
            this.ensureButton(record);
        });
    }

    ensureButton(record) {
        const { id, title } = record;
        if (this.taskbarButtons.has(id)) {
            this.updateButtonVisuals(id);
            return;
        }

        const btn = document.createElement('button');
        btn.className = 'taskbar-app-btn';
        btn.innerHTML = `<span>${title}</span>`;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleTaskbarClick(id);
        });

        this.taskbarAppsContainer.appendChild(btn);
        this.taskbarButtons.set(id, btn);
        this.updateButtonVisuals(id);
    }

    handleTaskbarClick(id) {
        const record = this.wm.windows.get(id);
        if (!record) return;

        if (record.state === 'closed' || record.state === 'minimized') {
            if (typeof this.wm.openWindow === 'function') {
                this.wm.openWindow(id);
            }
        } else if (this.wm.activeWindowId === id) {
            if (typeof this.wm.minimizeWindow === 'function') {
                this.wm.minimizeWindow(id);
            }
        } else {
            if (typeof this.wm.focusWindow === 'function') {
                this.wm.focusWindow(id);
            }
        }
        this.updateButtonVisuals(id);
    }

    updateButtonVisuals(id) {
        const record = this.wm.windows.get(id);
        const btn = this.taskbarButtons.get(id);

        if (!record || !btn) return;

        const isOpen = record.state !== 'closed' && record.state !== 'minimized';
        const isMinimized = record.state === 'minimized';
        const isActive = this.wm.activeWindowId === id && !isMinimized;

        btn.classList.toggle('active', isActive);
        btn.classList.toggle('open', isOpen || isMinimized);
        btn.classList.toggle('minimized', isMinimized);
    }

    startPollSync() {
        this.intervalId = setInterval(() => {
            if (!this.wm || !this.wm.windows) return;

            this.wm.windows.forEach((record, id) => {
                this.ensureButton(record);
            });

            this.taskbarButtons.forEach((btn, id) => {
                if (!this.wm.windows.has(id)) {
                    btn.remove();
                    this.taskbarButtons.delete(id);
                } else {
                    this.updateButtonVisuals(id);
                }
            });
        }, 100);
    }

    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.taskbarButtons.forEach((btn) => btn.remove());
        this.taskbarButtons.clear();
    }
}

