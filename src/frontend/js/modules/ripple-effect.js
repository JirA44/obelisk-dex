/**
 * OBELISK Ripple Effect
 * Material Design style ripple effect for buttons
 */

(function() {
    'use strict';

    function createRipple(event) {
        const button = event.currentTarget;

        // Don't ripple on disabled buttons
        if (button.disabled) return;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

        // Remove any existing ripples
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        button.appendChild(ripple);

        // Remove ripple after animation
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    // Use event delegation for efficiency
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button, .btn, .tab-btn, .page-btn');
        if (button) {
            createRipple({ currentTarget: button, clientX: e.clientX, clientY: e.clientY });
        }
    });

    console.log('[RippleEffect] Initialized');
})();
