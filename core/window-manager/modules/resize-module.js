class ResizeModule {
    constructor(windowManagerInstance) {
        this.wm = windowManagerInstance;
        this.activeResize = {
            windowId: null,
            edge: null,
            startX: 0,
            startY: 0,
            initialLeft: 0,
            initialTop: 0,
            initialWidth: 0,
            initialHeight: 0,
            rafId: null
        };

        this.boundPointerMove = this.handlePointerMove.bind(this);
        this.boundPointerUp = this.handlePointerUp.bind(this);

        this.init();
    }

    init() {
        this.attachGlobalListeners();
        this.enhanceExistingWindows();
    }

    attachGlobalListeners() {
        window.addEventListener('pointermove', this.boundPointerMove, { passive: false });
        window.addEventListener('pointerup', this.boundPointerUp, { passive: true });
        window.addEventListener('pointercancel', this.boundPointerUp, { passive: true });
    }

    enhanceExistingWindows() {
        if (!this.wm || !this.wm.windows) return;
        this.wm.windows.forEach((record) => {
            this.setupHandlesForWindow(record);
        });

        const originalOpenWindow = this.wm.openWindow.bind(this.wm);
        this.wm.openWindow = (id) => {
            originalOpenWindow(id);
            const record = this.wm.windows.get(id);
            if (record) {
                this.setupHandlesForWindow(record);
            }
        };
    }

    setupHandlesForWindow(record) {
        const { element, id } = record;
        if (!element || element.dataset.resizeEnhanced === 'true') return;

        const edges = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
        edges.forEach(edge => {
            let handle = element.querySelector(`.resize-handle-${edge}`);
            if (!handle) {
                handle = document.createElement('div');
                handle.className = `resize-handle resize-handle-${edge}`;
                element.appendChild(handle);
            }

            handle.addEventListener('pointerdown', (e) => {
                if (record.state === 'maximized') return;
                e.stopPropagation();
                this.wm.focusWindow(id);
                this.startResize(e, id, edge);
            });
        });

        element.dataset.resizeEnhanced = 'true';
    }

    startResize(e, id, edge) {
        const record = this.wm.windows.get(id);
        if (!record || record.state === 'maximized') return;

        this.activeResize.windowId = id;
        this.activeResize.edge = edge;
        this.activeResize.startX = e.clientX;
        this.activeResize.startY = e.clientY;
        this.activeResize.initialLeft = record.bounds.left;
        this.activeResize.initialTop = record.bounds.top;
        this.activeResize.initialWidth = record.bounds.width;
        this.activeResize.initialHeight = record.bounds.height;

        record.element.classList.add('is-resizing');
        if (e.target && typeof e.target.setPointerCapture === 'function') {
            try {
                e.target.setPointerCapture(e.pointerId);
            } catch (err) {}
        }
        e.preventDefault();
    }

    handlePointerMove(e) {
        if (!this.activeResize.windowId || !this.activeResize.edge) return;

        if (this.activeResize.rafId) {
            cancelAnimationFrame(this.activeResize.rafId);
        }

        const currentX = e.clientX;
        const currentY = e.clientY;

        this.activeResize.rafId = requestAnimationFrame(() => {
            const record = this.wm.windows.get(this.activeResize.windowId);
            if (!record) return;

            const dx = currentX - this.activeResize.startX;
            const dy = currentY - this.activeResize.startY;
            const edge = this.activeResize.edge;

            const minWidth = this.wm.config ? this.wm.config.minWidth || 280 : 280;
            const minHeight = this.wm.config ? this.wm.config.minHeight || 180 : 180;

            let newWidth = this.activeResize.initialWidth;
            let newHeight = this.activeResize.initialHeight;
            let newLeft = this.activeResize.initialLeft;
            let newTop = this.activeResize.initialTop;

            if (edge.includes('right')) {
                newWidth = Math.max(minWidth, this.activeResize.initialWidth + dx);
            }
            if (edge.includes('bottom')) {
                newHeight = Math.max(minHeight, this.activeResize.initialHeight + dy);
            }
            if (edge.includes('left')) {
                const potentialWidth = this.activeResize.initialWidth - dx;
                if (potentialWidth >= minWidth) {
                    newWidth = potentialWidth;
                    newLeft = this.activeResize.initialLeft + dx;
                }
            }
            if (edge.includes('top')) {
                const potentialHeight = this.activeResize.initialHeight - dy;
                if (potentialHeight >= minHeight) {
                    newHeight = potentialHeight;
                    newTop = this.activeResize.initialTop + dy;
                }
            }

            record.bounds.left = newLeft;
            record.bounds.top = newTop;
            record.bounds.width = newWidth;
            record.bounds.height = newHeight;

            if (typeof this.wm.applyBoundsToDOM === 'function') {
                this.wm.applyBoundsToDOM(record);
            } else {
                record.element.style.left = `${newLeft}px`;
                record.element.style.top = `${newTop}px`;
                record.element.style.width = `${newWidth}px`;
                record.element.style.height = `${newHeight}px`;
            }
        });

        if (e.cancelable) {
            e.preventDefault();
        }
    }

    handlePointerUp() {
        if (!this.activeResize.windowId) return;

        const record = this.wm.windows.get(this.activeResize.windowId);
        if (record && record.element) {
            record.element.classList.remove('is-resizing');
        }

        this.activeResize.windowId = null;
        this.activeResize.edge = null;
        if (this.activeResize.rafId) {
            cancelAnimationFrame(this.activeResize.rafId);
            this.activeResize.rafId = null;
        }
    }
        }

