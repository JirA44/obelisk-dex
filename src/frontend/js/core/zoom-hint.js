/**
 * OBELISK DEX - Zoom Hint
 * Affiche un conseil de zoom si le contenu deborde
 */

const ZoomHint = {
    init() {
        // Creer l'indicateur
        const hint = document.createElement('div');
        hint.id = 'zoom-hint';
        hint.innerHTML = '🔍 Ctrl + Scroll pour zoomer';
        hint.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff88;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 9000;
            border: 1px solid #00ff88;
            animation: fadeInOut 5s ease-in-out;
            pointer-events: none;
        `;
        
        // Ajouter animation CSS
        if (!document.getElementById('zoom-hint-style')) {
            const style = document.createElement('style');
            style.id = 'zoom-hint-style';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                #zoom-hint.hidden { display: none; }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(hint);
        
        // Cacher apres 5s
        setTimeout(() => {
            hint.classList.add('hidden');
        }, 5000);
        
        // Detecter si scroll necessaire dans nav-tabs
        this.checkOverflow();
        
        console.log('🔍 Zoom Hint loaded');
    },
    
    checkOverflow() {
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs && navTabs.scrollWidth > navTabs.clientWidth) {
            // Ajouter indicateur de scroll
            const scrollHint = document.createElement('div');
            scrollHint.innerHTML = '→';
            scrollHint.style.cssText = `
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                background: linear-gradient(90deg, transparent, rgba(0,0,0,0.8));
                color: #00ff88;
                padding: 5px 10px 5px 20px;
                font-size: 16px;
                pointer-events: none;
            `;
            navTabs.style.position = 'relative';
            navTabs.appendChild(scrollHint);
        }
    }
};

// Auto-init apres chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ZoomHint.init());
} else {
    setTimeout(() => ZoomHint.init(), 500);
}

window.ZoomHint = ZoomHint;
