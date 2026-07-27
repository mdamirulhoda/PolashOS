class VirtualDesktopModule {
    constructor(windowManagerInstance) {
        this.wm = windowManagerInstance;
        this.desktops = new Map();
        this.currentDesktopId = 'desktop-1';

        this.init();
    }

    init() {
        this.createDesktop('desktop-1', 'Desktop 1');
        this.createDesktop('desktop-2', 'Desktop 2');
        this.bindWindowManagerRecords();
    }

    createDesktop(id, name) {
        if (this.desktops.has(id)) return;
        this.desktops.set(id, {
            id: id,
            name: name,
            windowIds: new Set()
        });
    }

    bindWindowManagerRecords() {
        if (!this.wm || !this.wm.windows) return;

        this.wm.windows.forEach((record, id) => {
            if (!record.virtualDesktop) {
                record.virtualDesktop = this.currentDesktopId;
            }
            const desktop = this.desktops.get(record.virtualDesktop);
            if (desktop) {
                desktop.windowIds.add(id);
            }
        });
    }

    switchDesktop(targetDesktopId) {
        if (!this.desktops.has(targetDesktopId) || this.currentDesktopId === targetDesktopId) return;

        const currentDesktop = this.desktops.get(this.currentDesktopId);
        const targetDesktop = this.desktops.get(targetDesktopId);

        if (currentDesktop) {
            currentDesktop.windowIds.forEach(id => {
                const record = this.wm.windows.get(id);
                if (record && record.element) {
                    if (!record.element.hidden) {
                        record.wasVisibleBeforeSwitch = true;
                        record.element.style.display = 'none';
                        record.element.hidden = true;
                    }
                }
            });
        }

        this.currentDesktopId = targetDesktopId;

        if (targetDesktop) {
            targetDesktop.windowIds.forEach(id => {
                const record = this.wm.windows.get(id);
                if (record && record.element && record.wasVisibleBeforeSwitch) {
                    record.element.style.display = 'flex';
                    record.element.hidden = false;
                    record.wasVisibleBeforeSwitch = false;
                }
            });
        }

        if (typeof this.wm.findNextActiveWindow === 'function') {
            this.wm.findNextActiveWindow();
        }
    }

    assignWindowToDesktop(windowId, desktopId) {
        const record = this.wm.windows.get(windowId);
        if (!record || !this.desktops.has(desktopId)) return;

        this.desktops.forEach(desktop => {
            desktop.windowIds.delete(windowId);
        });

        record.virtualDesktop = desktopId;
        this.desktops.get(desktopId).windowIds.add(windowId);

        if (desktopId !== this.currentDesktopId) {
            if (record.element) {
                record.element.style.display = 'none';
                record.element.hidden = true;
            }
        }
    }
}

