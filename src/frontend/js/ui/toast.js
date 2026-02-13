/**
 * Obelisk Toast Notification System
 * Replaces alert() with non-blocking toast notifications
 */
const ObeliskToast = (function() {
    'use strict';

    let container = null;

    function init() {
        if (container) return;
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:700;display:flex;flex-direction:column;gap:10px;max-width:400px;pointer-events:none;';
        document.body.appendChild(container);
    }

    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#00ff88" stroke-width="2"/><path d="M6 10l3 3 5-6" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#ff4444" stroke-width="2"/><path d="M7 7l6 6M13 7l-6 6" stroke="#ff4444" stroke-width="2" stroke-linecap="round"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l9 16H1L10 2z" stroke="#f7931a" stroke-width="2" fill="none"/><path d="M10 8v4M10 14v1" stroke="#f7931a" stroke-width="2" stroke-linecap="round"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#00d4ff" stroke-width="2"/><path d="M10 9v5M10 6v1" stroke="#00d4ff" stroke-width="2" stroke-linecap="round"/></svg>'
    };

    const colors = {
        success: { border: '#00ff88', bg: 'rgba(0,255,136,0.08)' },
        error:   { border: '#ff4444', bg: 'rgba(255,68,68,0.08)' },
        warning: { border: '#f7931a', bg: 'rgba(247,147,26,0.08)' },
        info:    { border: '#00d4ff', bg: 'rgba(0,212,255,0.08)' }
    };

    function show(message, type, duration) {
        init();
        type = type || 'info';
        duration = duration || 4000;
        const c = colors[type] || colors.info;

        const toast = document.createElement('div');
        toast.style.cssText = `pointer-events:auto;display:flex;align-items:flex-start;gap:12px;padding:14px 18px;background:${c.bg};backdrop-filter:blur(12px);border:1px solid ${c.border};border-radius:12px;color:#e8e4d9;font-size:14px;line-height:1.4;box-shadow:0 4px 24px rgba(0,0,0,0.4);animation:toastIn 0.3s ease;cursor:pointer;max-width:100%;`;
        toast.innerHTML = `<span style="flex-shrink:0;margin-top:1px">${icons[type] || icons.info}</span><span style="flex:1">${DOMPurify ? DOMPurify.sanitize(message) : message}</span>`;
        toast.onclick = () => dismiss(toast);

        container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => dismiss(toast), duration);
        }
        return toast;
    }

    function dismiss(toast) {
        if (!toast || !toast.parentNode) return;
        toast.style.animation = 'toastOut 0.25s ease forwards';
        setTimeout(() => toast.remove(), 250);
    }

    // Inject keyframes
    if (!document.getElementById('toast-keyframes')) {
        const style = document.createElement('style');
        style.id = 'toast-keyframes';
        style.textContent = `
            @keyframes toastIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
            @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(40px); } }
        `;
        document.head.appendChild(style);
    }

    return { show, dismiss, success: (m,d) => show(m,'success',d), error: (m,d) => show(m,'error',d), warning: (m,d) => show(m,'warning',d), info: (m,d) => show(m,'info',d) };
})();

// Global shortcut
window.showToast = ObeliskToast.show;
