/**
 * Obelisk DEX - Debug Panel
 * Captures and displays all console logs, errors, and warnings
 */

const DebugPanel = {
    logs: [],
    maxLogs: 100,
    panel: null,
    isVisible: true,

    init() {
        this.createPanel();
        this.interceptConsole();
        this.interceptErrors();
        this.log('info', 'Debug Panel initialized');
    },

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'debug-panel';
        this.panel.innerHTML = `
            <div class="debug-header">
                <span>Debug Console</span>
                <div class="debug-controls">
                    <button class="debug-copy" title="Copy logs">Copy</button>
                    <button class="debug-clear" title="Clear logs">Clear</button>
                    <button class="debug-toggle" title="Minimize">_</button>
                </div>
            </div>
            <div class="debug-content"></div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #debug-panel {
                position: fixed;
                bottom: 10px;
                right: 10px;
                width: 450px;
                max-height: 300px;
                background: rgba(0, 0, 0, 0.95);
                border: 1px solid #00ff88;
                border-radius: 8px;
                font-family: 'Monaco', 'Consolas', monospace;
                font-size: 11px;
                z-index: 99999;
                box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
            }
            #debug-panel.minimized {
                max-height: 32px;
                overflow: hidden;
            }
            #debug-panel.minimized .debug-content {
                display: none;
            }
            .debug-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: linear-gradient(90deg, #00ff88, #00aaff);
                color: #000;
                font-weight: bold;
                font-size: 12px;
                border-radius: 7px 7px 0 0;
            }
            .debug-controls {
                display: flex;
                gap: 6px;
            }
            .debug-controls button {
                background: rgba(0,0,0,0.3);
                border: none;
                color: #000;
                padding: 2px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-weight: bold;
            }
            .debug-controls button:hover {
                background: rgba(0,0,0,0.5);
                color: #fff;
            }
            .debug-content {
                max-height: 260px;
                overflow-y: auto;
                padding: 8px;
            }
            .debug-content::-webkit-scrollbar {
                width: 6px;
            }
            .debug-content::-webkit-scrollbar-thumb {
                background: #00ff88;
                border-radius: 3px;
            }
            .debug-log {
                padding: 4px 6px;
                margin: 2px 0;
                border-radius: 4px;
                word-break: break-all;
                border-left: 3px solid;
            }
            .debug-log.info {
                background: rgba(0, 170, 255, 0.1);
                border-color: #00aaff;
                color: #00aaff;
            }
            .debug-log.warn {
                background: rgba(255, 170, 0, 0.1);
                border-color: #ffaa00;
                color: #ffaa00;
            }
            .debug-log.error {
                background: rgba(255, 68, 68, 0.1);
                border-color: #ff4444;
                color: #ff4444;
            }
            .debug-log.success {
                background: rgba(0, 255, 136, 0.1);
                border-color: #00ff88;
                color: #00ff88;
            }
            .debug-time {
                color: #888;
                margin-right: 8px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(this.panel);

        // Event listeners
        this.panel.querySelector('.debug-toggle').addEventListener('click', () => {
            this.panel.classList.toggle('minimized');
            this.panel.querySelector('.debug-toggle').textContent =
                this.panel.classList.contains('minimized') ? '[]' : '_';
        });

        this.panel.querySelector('.debug-clear').addEventListener('click', () => {
            this.logs = [];
            this.panel.querySelector('.debug-content').innerHTML = '';
            this.log('info', 'Logs cleared');
        });

        this.panel.querySelector('.debug-copy').addEventListener('click', () => {
            const text = this.logs.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
            navigator.clipboard.writeText(text).then(() => {
                this.log('success', 'Logs copied to clipboard!');
            });
        });
    },

    interceptConsole() {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args) => {
            this.log('info', args.map(a => this.stringify(a)).join(' '));
            originalLog.apply(console, args);
        };

        console.warn = (...args) => {
            this.log('warn', args.map(a => this.stringify(a)).join(' '));
            originalWarn.apply(console, args);
        };

        console.error = (...args) => {
            this.log('error', args.map(a => this.stringify(a)).join(' '));
            originalError.apply(console, args);
        };
    },

    interceptErrors() {
        window.addEventListener('error', (e) => {
            this.log('error', `${e.message} (${e.filename}:${e.lineno})`);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.log('error', `Unhandled Promise: ${this.stringify(e.reason)}`);
        });
    },

    stringify(obj) {
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        if (typeof obj === 'string') return obj;
        if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
        if (obj instanceof Error) return `${obj.name}: ${obj.message}`;
        if (typeof obj === 'object') {
            try {
                return JSON.stringify(obj, null, 0).substring(0, 500);
            } catch (e) {
                return Object.prototype.toString.call(obj);
            }
        }
        return String(obj);
    },

    log(type, message) {
        const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });

        this.logs.push({ type, message, time });
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        if (this.panel) {
            const content = this.panel.querySelector('.debug-content');
            const entry = document.createElement('div');
            entry.className = `debug-log ${type}`;
            entry.innerHTML = `<span class="debug-time">${time}</span>${this.escapeHtml(message)}`;
            content.appendChild(entry);
            content.scrollTop = content.scrollHeight;
        }
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DebugPanel.init());
} else {
    DebugPanel.init();
}

window.DebugPanel = DebugPanel;
