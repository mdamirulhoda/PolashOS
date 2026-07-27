class TouchModule {
    constructor(windowManagerInstance) {
        this.wm = windowManagerInstance;
        this.activePointers = new Map();

        this.init();
    }

    init() {
        this.applyTouchActionStyles();
        this.enhanceExistingWindows();
        this.attachGlobalPointerHooks();
    }

    applyTouchActionStyles() {
        if (document.getElementById('polash-touch-styles')) return;

        const style = document.createElement('style');
        style.id = 'polash-touch-styles';
        style.textContent = `
            .window, .polash-window,
            .window-titlebar, .polash-titlebar,
            .resize-handle {
                touch-action: none !important;
                -webkit-user-select: none;
                user-select: none;
                -webkit-touch-callout: none;
            }
        `;
        document.head.appendChild(style);
    }

    enhanceExistingWindows() {
        if (!this.wm || !this.wm.windows) return;

        this.wm.windows.forEach((record) => {
            this.setupTouchForWindow(record);
        });

        const originalOpenWindow = this.wm.openWindow.bind(this.wm);
        this.wm.openWindow = (id) => {
            originalOpenWindow(id);
            const record = this.wm.windows.get(id);
            if (record) {
                this.setupTouchForWindow(record);
            }
        };
    }

    setupTouchForWindow(record) {
        const { element } = record;
        if (!element || element.dataset.touchEnhanced === 'true') return;

        const titlebar = element.querySelector('.window-titlebar, .polash-titlebar');

        if (titlebar) {
            titlebar.addEventListener('pointerdown', (e) => {
                this.handleTitlebarPointerDown(e, record);
            }, { passive: false });
        }

        element.dataset.touchEnhanced = 'true';
    }

    handleTitlebarPointerDown(e, record) {
        if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
        if (e.target.closest('button') || e.target.closest('.window-controls')) return;

        const target = e.currentTarget;

        try {
            target.setPointerCapture(e.pointerId);
            this.activePointers.set(e.pointerId, target);
        } catch (err) {}

        if (e.cancelable) {
            e.preventDefault();
        }
    }

    attachGlobalPointerHooks() {
        const originalPointerUp = this.wm.handleGlobalPointerUp ? this.wm.handleGlobalPointerUp.bind(this.wm) : null;

        window.addEventListener('pointerup', (e) => {
            this.releaseCapturedPointer(e.pointerId);
            if (originalPointerUp) originalPointerUp(e);
        }, { passive: true });

        window.addEventListener('pointercancel', (e) => {
            this.releaseCapturedPointer(e.pointerId);
            if (originalPointerUp) originalPointerUp(e);
        }, { passive: true });
    }

    releaseCapturedPointer(pointerId) {
        if (this.activePointers.has(pointerId)) {
            const target = this.activePointers.get(pointerId);
            try {
                if (target && typeof target.releasePointerCapture === 'function' && target.hasPointerCapture(pointerId)) {
                    target.releasePointerCapture(pointerId);
                }
            } catch (err) {}
            this.activePointers.delete(pointerId);
        }
    }
}

