class WindowSnapModule {
    constructor(windowManagerInstance) {
        this.wm = windowManagerInstance;
        this.previewOverlay = null;
        this.currentSnapState = null;
        this.init();
    }

    init() {
        this.createPreviewOverlay();
        this.patchInteractionHandlers();
    }

    createPreviewOverlay() {
        if (document.getElementById('snap-preview-overlay')) return;
        
        this.previewOverlay = document.createElement('div');
        this.previewOverlay.id = 'snap-preview-overlay';
        this.previewOverlay.className = 'snap-preview';
        document.body.appendChild(this.previewOverlay);
    }

    patchInteractionHandlers() {
        const originalMove = this.wm.handleGlobalPointerMove.bind(this.wm);
        const originalUp = this.wm.handleGlobalPointerUp.bind(this.wm);

        this.wm.handleGlobalPointerMove = (e) => {
            originalMove(e);
            if (this.wm.interaction && this.wm.interaction.mode === 'drag' && this.wm.interaction.windowId) {
                const snapZone = this.detectSnapZone(e.clientX, e.clientY);
                this.showPreview(snapZone);
                this.currentSnapState = snapZone;
            }
        };

        this.wm.handleGlobalPointerUp = (e) => {
            if (this.wm.interaction && this.wm.interaction.mode === 'drag' && this.currentSnapState && this.wm.interaction.windowId) {
                const windowId = this.wm.interaction.windowId;
                const zone = this.currentSnapState;
                this.hidePreview();
                this.executeSnap(windowId, zone);
                this.currentSnapState = null;
            } else {
                this.hidePreview();
            }
            originalUp(e);
        };
    }

    detectSnapZone(x, y) {
        const threshold = 15;
        const screenWidth = window.innerWidth;

        if (y <= threshold) return 'maximize';
        if (x <= threshold) return 'left';
        if (x >= screenWidth - threshold) return 'right';

        return null;
    }

    showPreview(zone) {
        if (!this.previewOverlay) return;
        if (!zone) {
            this.hidePreview();
            return;
        }

        let style = 'display: block;';
        const taskbarHeight = 50;

        switch (zone) {
            case 'left':
                style += 'left: 0; top: 0; width: 50vw; height: calc(100vh - ' + taskbarHeight + 'px);';
                break;
            case 'right':
                style += 'left: 50vw; top: 0; width: 50vw; height: calc(100vh - ' + taskbarHeight + 'px);';
                break;
            case 'maximize':
                style += 'left: 0; top: 0; width: 100vw; height: calc(100vh - ' + taskbarHeight + 'px);';
                break;
        }

        this.previewOverlay.style.cssText = style;
        this.previewOverlay.classList.add('active');
    }

    hidePreview() {
        if (!this.previewOverlay) return;
        this.previewOverlay.classList.remove('active');
        this.previewOverlay.style.display = 'none';
    }

    executeSnap(id, zone) {
        const record = this.wm.windows.get(id);
        if (!record) return;

        if (record.state === 'normal') {
            record.previousBounds = { ...record.bounds };
        }

        const taskbarHeight = 50;
        const usableHeight = window.innerHeight - taskbarHeight;

        switch (zone) {
            case 'left':
                record.state = 'snapped-left';
                record.bounds = { left: 0, top: 0, width: window.innerWidth / 2, height: usableHeight };
                break;
            case 'right':
                record.state = 'snapped-right';
                record.bounds = { left: window.innerWidth / 2, top: 0, width: window.innerWidth / 2, height: usableHeight };
                break;
            case 'maximize':
                this.wm.maximizeWindow(id);
                return;
        }

        if (typeof this.wm.applyBoundsToDOM === 'function') {
            this.wm.applyBoundsToDOM(record);
        } else {
            record.element.style.left = `${record.bounds.left}px`;
            record.element.style.top = `${record.bounds.top}px`;
            record.element.style.width = `${record.bounds.width}px`;
            record.element.style.height = `${record.bounds.height}px`;
        }
        this.wm.focusWindow(id);
    }
}

