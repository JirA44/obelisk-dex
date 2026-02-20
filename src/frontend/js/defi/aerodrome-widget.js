/**
 * AERODROME WIDGET — Réutilisable dans n'importe quelle page
 * Appel DeFi Llama direct (CORS OK, pas besoin de backend)
 * Invest nécessite localhost:3001
 *
 * Usage:
 *   <div id="aero-widget-MONID"></div>
 *   <script src="js/defi/aerodrome-widget.js"></script>
 *   <script>AeroWidget.mount('MONID')</script>
 */

const AeroWidget = (() => {

    const LLAMA = 'https://yields.llama.fi/pools';
    const LOCAL = 'http://localhost:3001/api/aerodrome';
    const isLocal = () => location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    // ── shared modal (one per page) ──────────────────────────────
    let _modalEl = null;
    let _currentPool = null;

    function ensureModal() {
        if (_modalEl) return;
        _modalEl = document.createElement('div');
        _modalEl.id = 'aero-global-modal';
        _modalEl.style.cssText = `display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;align-items:center;justify-content:center;`;
        _modalEl.innerHTML = `
            <div style="background:#0f0f2a;border:1px solid rgba(255,78,138,0.3);border-radius:20px;padding:28px;max-width:460px;width:90%;position:relative;max-height:90vh;overflow-y:auto;">
                <button onclick="AeroWidget._closeModal()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.06);border:none;border-radius:8px;width:30px;height:30px;color:#888;font-size:16px;cursor:pointer;">✕</button>
                <h3 id="aw-title" style="color:#fff;margin-bottom:4px;font-size:18px;"></h3>
                <p id="aw-sub" style="color:#666;font-size:12px;margin-bottom:18px;"></p>

                <div style="background:rgba(255,78,138,0.06);border:1px solid rgba(255,78,138,0.2);border-radius:12px;padding:14px;margin-bottom:16px;font-size:13px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:#666;">APY</span><span id="aw-apy" style="color:#00e676;font-weight:700;"></span></div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:#666;">TVL</span><span id="aw-tvl" style="color:#fff;"></span></div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:#666;">Type</span><span id="aw-type" style="color:#fff;"></span></div>
                    <div style="display:flex;justify-content:space-between;"><span style="color:#666;">IL Risk</span><span id="aw-il" style="color:#ff8c42;"></span></div>
                </div>

                <div style="background:rgba(0,230,118,0.05);border:1px solid rgba(0,230,118,0.15);border-radius:12px;padding:12px;margin-bottom:16px;font-size:12px;">
                    <div style="color:#555;margin-bottom:6px;">📊 Rendement estimé</div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#666;">Quotidien</span><span id="aw-daily" style="color:#00e676;font-weight:600;"></span></div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#666;">Mensuel</span><span id="aw-monthly" style="color:#00e676;font-weight:600;"></span></div>
                    <div style="display:flex;justify-content:space-between;"><span style="color:#666;">Annuel</span><span id="aw-yearly" style="color:#00e676;font-weight:600;"></span></div>
                </div>

                <label style="color:#aaa;font-size:12px;display:block;margin-bottom:6px;">Montant (USD)</label>
                <input id="aw-amount" type="number" value="10" min="0.5" step="1"
                    style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:#fff;padding:12px 14px;border-radius:10px;font-size:22px;font-weight:700;margin-bottom:8px;"
                    oninput="AeroWidget._updateProjections()">
                <div style="display:flex;gap:6px;margin-bottom:16px;">
                    ${[5,10,25,50,100].map(v=>`<button onclick="AeroWidget._setAmt(${v})" style="flex:1;padding:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:7px;color:#888;cursor:pointer;font-size:12px;">$${v}</button>`).join('')}
                </div>

                <div id="aw-steps" style="display:none;margin-bottom:16px;font-size:12px;"></div>
                <div id="aw-result" style="display:none;border-radius:10px;padding:12px;margin-bottom:16px;font-size:13px;"></div>

                <div style="display:flex;gap:10px;">
                    <button onclick="AeroWidget._exec(true)" id="aw-sim-btn" style="flex:1;padding:13px;background:linear-gradient(135deg,#8a2be2,#5a1dbe);border:none;color:#fff;border-radius:12px;cursor:pointer;font-weight:700;font-size:13px;">🧪 Simuler</button>
                    <button onclick="AeroWidget._exec(false)" id="aw-live-btn" style="flex:1;padding:13px;background:linear-gradient(135deg,#ff4e8a,#ff8c42);border:none;color:#fff;border-radius:12px;cursor:pointer;font-weight:700;font-size:13px;">⚡ Investir</button>
                </div>
                <p style="text-align:center;color:#444;font-size:11px;margin-top:10px;">Bridge → Swap 50/50 → Add Liquidity Aerodrome</p>
            </div>`;
        document.body.appendChild(_modalEl);
        _modalEl.addEventListener('click', e => { if (e.target === _modalEl) AeroWidget._closeModal(); });
    }

    function fmtApy(v) {
        if (v > 9999) return `${(v/1000).toFixed(0)}k%`;
        if (v > 999)  return `${v.toFixed(0)}%`;
        return `${parseFloat(v.toFixed(1))}%`;
    }
    function fmtTvl(v) {
        return v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : `$${(v/1e3).toFixed(0)}K`;
    }

    // ── fetch pools from DeFi Llama ──────────────────────────────
    async function fetchPools() {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 20000);
        try {
            const r = await fetch(LLAMA, { signal: controller.signal });
            clearTimeout(tid);
            if (!r.ok) throw new Error(`DeFi Llama ${r.status}`);
            const d = await r.json();
            return (d.data || [])
                .filter(p =>
                    (p.project||'').toLowerCase().includes('aerodrome') &&
                    p.chain === 'Base' &&
                    (p.tvlUsd||0) >= 50000 &&
                    p.apy != null &&
                    p.status !== 'dead'
                )
                .sort((a,b) => (b.apy||0)-(a.apy||0))
                .slice(0, 100)
                .map((p, i) => ({
                    rank:      i + 1,
                    symbol:    p.symbol,
                    tvlUsd:    Math.round(p.tvlUsd||0),
                    apy:       parseFloat((p.apy||0).toFixed(2)),
                    apyBase:   parseFloat((p.apyBase||0).toFixed(2)),
                    apyReward: parseFloat((p.apyReward||0).toFixed(2)),
                    stable:    !!(p.poolMeta?.includes('stable')),
                    ilRisk:    p.ilRisk || 'no',
                    tokens:    p.underlyingTokens || [],
                    project:   p.project,
                }));
        } catch(e) {
            clearTimeout(tid);
            throw e;
        }
    }

    // ── render a single pool row/card ────────────────────────────
    function poolCard(pool, compact) {
        const apyCol = pool.apy > 1000 ? '#ff4444' : pool.apy > 100 ? '#ff9900' : '#00e676';
        const parts  = pool.symbol.split('-');
        const tok0   = (parts[0]||'?').slice(0,4);
        const tok1   = (parts[1]||'?').slice(0,4);
        const isCL   = pool.project === 'aerodrome-slipstream';
        const hasTokens = pool.tokens.length === 2;

        if (compact) {
            // Compact row for inline widget
            return `
            <div onclick="AeroWidget._open(${JSON.stringify(pool).replace(/"/g,'&quot;')})"
                style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;cursor:pointer;transition:all 0.2s;"
                onmouseover="this.style.borderColor='rgba(255,78,138,0.4)';this.style.background='rgba(255,78,138,0.04)'"
                onmouseout="this.style.borderColor='rgba(255,255,255,0.07)';this.style.background='rgba(255,255,255,0.03)'">
                <span style="color:#555;font-size:11px;width:22px;">#${pool.rank}</span>
                <div style="flex:1;">
                    <div style="font-weight:700;color:#fff;font-size:13px;">${pool.symbol}${isCL?'<span style="color:#cc88ff;font-size:10px;margin-left:4px;">CL</span>':''}</div>
                    <div style="color:#555;font-size:11px;">${pool.stable?'Stable':'Volatile'} · TVL ${fmtTvl(pool.tvlUsd)}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700;color:${apyCol};font-size:14px;">${fmtApy(pool.apy)}</div>
                    <div style="color:#444;font-size:10px;">APY</div>
                </div>
                <button onclick="event.stopPropagation();AeroWidget._open(${JSON.stringify(pool).replace(/"/g,'&quot;')})"
                    style="padding:5px 12px;background:${hasTokens?'linear-gradient(135deg,#ff4e8a,#ff8c42)':'rgba(255,255,255,0.06)'};border:none;border-radius:7px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;">
                    ${hasTokens ? '1-Click' : '🔗 Aero'}
                </button>
            </div>`;
        }
        // Full card (for aerodrome.html)
        return `<div>Full card</div>`;
    }

    // ── mount widget into a container ────────────────────────────
    function mount(containerId, opts = {}) {
        const el = document.getElementById('aero-widget-' + containerId);
        if (!el) { console.warn('[AeroWidget] container not found:', containerId); return; }

        el.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:18px;">🚀</span>
                    <span style="font-weight:700;color:#fff;font-size:15px;">Aerodrome Finance</span>
                    <span style="background:linear-gradient(135deg,#0052ff,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:12px;">Base · LIVE</span>
                </div>
                <div style="display:flex;gap:6px;align-items:center;">
                    <input id="aw-search-${containerId}" type="text" placeholder="Rechercher..." oninput="AeroWidget._filter('${containerId}')"
                        style="padding:5px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:7px;color:#fff;font-size:12px;width:130px;">
                    <select id="aw-type-${containerId}" onchange="AeroWidget._filter('${containerId}')"
                        style="padding:5px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:7px;color:#aaa;font-size:12px;">
                        <option value="">Tous</option>
                        <option value="volatile">Volatile</option>
                        <option value="stable">Stable</option>
                        <option value="high">APY 1000%+</option>
                    </select>
                    <button onclick="AeroWidget._reload('${containerId}')" style="padding:5px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:7px;color:#888;font-size:12px;cursor:pointer;">↻</button>
                </div>
            </div>
            <div id="aw-list-${containerId}" style="display:flex;flex-direction:column;gap:6px;max-height:${opts.maxHeight||'400px'};overflow-y:auto;">
                <div style="text-align:center;padding:30px;color:#555;">
                    <div style="width:28px;height:28px;border:2px solid rgba(255,78,138,0.3);border-top-color:#ff4e8a;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 10px;"></div>
                    Chargement des pools...
                </div>
            </div>`;

        ensureModal();
        _reload(containerId);
    }

    const _poolCache = {}; // containerId → pools[]

    async function _reload(containerId) {
        const list = document.getElementById('aw-list-' + containerId);
        if (!list) return;
        list.innerHTML = '<div style="text-align:center;padding:30px;color:#555;"><div style="width:28px;height:28px;border:2px solid rgba(255,78,138,0.3);border-top-color:#ff4e8a;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 10px;"></div>Chargement DeFi Llama...</div>';
        try {
            const pools = await fetchPools();
            _poolCache[containerId] = pools;
            _render(containerId);
        } catch(e) {
            list.innerHTML = `<div style="text-align:center;padding:20px;color:#ff6666;">⚠️ ${e.message}<br><button onclick="AeroWidget._reload('${containerId}')" style="margin-top:8px;padding:6px 14px;background:rgba(255,78,138,0.1);border:1px solid rgba(255,78,138,0.3);border-radius:7px;color:#ff4e8a;cursor:pointer;font-size:12px;">↻ Réessayer</button></div>`;
        }
    }

    function _filter(containerId) {
        _render(containerId);
    }

    function _render(containerId) {
        const list   = document.getElementById('aw-list-' + containerId);
        const search = (document.getElementById('aw-search-' + containerId)?.value || '').toLowerCase();
        const type   = document.getElementById('aw-type-'   + containerId)?.value || '';
        let pools = (_poolCache[containerId] || []).filter(p => {
            if (search && !p.symbol.toLowerCase().includes(search)) return false;
            if (type === 'stable'   && !p.stable)        return false;
            if (type === 'volatile' &&  p.stable)        return false;
            if (type === 'high'     &&  p.apy < 1000)    return false;
            return true;
        });
        if (!pools.length) {
            list.innerHTML = '<div style="text-align:center;padding:20px;color:#555;">Aucun pool trouvé.</div>';
            return;
        }
        list.innerHTML = pools.map(p => poolCard(p, true)).join('');
    }

    function _open(pool) {
        _currentPool = pool;
        ensureModal();

        document.getElementById('aw-title').textContent  = pool.symbol;
        document.getElementById('aw-sub').textContent    = 'Aerodrome Finance — Base Chain';
        document.getElementById('aw-apy').textContent    = fmtApy(pool.apy) + ' APY';
        document.getElementById('aw-tvl').textContent    = fmtTvl(pool.tvlUsd);
        document.getElementById('aw-type').textContent   = pool.stable ? 'Stable Pool' : 'Volatile Pool';
        document.getElementById('aw-il').textContent     = pool.ilRisk === 'yes' ? 'Oui (Volatile)' : 'Faible';
        document.getElementById('aw-steps').style.display  = 'none';
        document.getElementById('aw-result').style.display = 'none';

        _updateProjections();
        _modalEl.style.display = 'flex';
    }

    function _closeModal() {
        if (_modalEl) _modalEl.style.display = 'none';
        _currentPool = null;
    }

    function _setAmt(v) {
        const el = document.getElementById('aw-amount');
        if (el) { el.value = v; _updateProjections(); }
    }

    function _updateProjections() {
        if (!_currentPool) return;
        const amt  = parseFloat(document.getElementById('aw-amount')?.value) || 0;
        const daily = amt * (_currentPool.apy/100) / 365;
        document.getElementById('aw-daily').textContent   = '$' + daily.toFixed(4);
        document.getElementById('aw-monthly').textContent = '$' + (daily*30).toFixed(2);
        document.getElementById('aw-yearly').textContent  = '$' + (amt*_currentPool.apy/100).toFixed(2);
    }

    async function _exec(simulate) {
        if (!_currentPool) return;
        const amt = parseFloat(document.getElementById('aw-amount')?.value) || 0;
        if (amt < 0.5) { alert('Minimum $0.50'); return; }

        const simBtn  = document.getElementById('aw-sim-btn');
        const liveBtn = document.getElementById('aw-live-btn');
        const stepsEl = document.getElementById('aw-steps');
        const resultEl= document.getElementById('aw-result');

        if (simBtn) simBtn.disabled = true;
        if (liveBtn) liveBtn.disabled = true;
        stepsEl.style.display = 'block';
        stepsEl.innerHTML = '<div style="color:#555;">Exécution en cours...</div>';
        resultEl.style.display = 'none';

        try {
            if (!isLocal() && !simulate) throw new Error('Invest réel nécessite le serveur Obelisk local (pm2 start obelisk)');

            const r = await fetch(`${LOCAL}/invest/1click`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token0:    _currentPool.tokens[0] || '',
                    token1:    _currentPool.tokens[1] || '',
                    stable:    _currentPool.stable,
                    symbol:    _currentPool.symbol,
                    amountUSD: amt,
                    simulate,
                }),
            });
            const d = await r.json();

            stepsEl.innerHTML = (d.steps||[]).map(s => `
                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="color:#aaa;">${s.step}. ${s.name}</span>
                    <span style="color:${s.status==='ok'?'#00e676':s.status==='simulated'?'#9b59b6':s.status==='skipped'?'#555':'#ff6666'}">${s.status}</span>
                </div>`).join('');

            resultEl.style.display = 'block';
            resultEl.style.background = d.success ? 'rgba(0,230,118,0.07)' : 'rgba(255,70,70,0.07)';
            resultEl.style.border     = d.success ? '1px solid rgba(0,230,118,0.2)' : '1px solid rgba(255,70,70,0.2)';
            resultEl.innerHTML = `<span style="color:${d.success?'#00e676':'#ff6666'};font-weight:700;">${d.success?(simulate?'🧪 Simulation OK':'✅ Investi!'):'❌ Erreur'}</span><br><span style="color:#aaa;font-size:12px;">${d.message||d.error||''}</span>${d.basescan?`<br><a href="${d.basescan}" target="_blank" style="color:#4da6ff;font-size:11px;">Voir sur Basescan →</a>`:''}`;

        } catch(e) {
            stepsEl.innerHTML = '';
            resultEl.style.display = 'block';
            resultEl.style.background = 'rgba(255,70,70,0.07)';
            resultEl.style.border     = '1px solid rgba(255,70,70,0.2)';
            resultEl.innerHTML = `<span style="color:#ff6666;">❌ ${e.message}</span>`;
        }

        if (simBtn) simBtn.disabled = false;
        if (liveBtn) liveBtn.disabled = false;
    }

    // ── CSS spinner (inject once) ───────────────────────────────
    if (!document.getElementById('aw-css')) {
        const s = document.createElement('style');
        s.id = 'aw-css';
        s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
        document.head.appendChild(s);
    }

    return { mount, _reload, _filter, _render, _open, _closeModal, _setAmt, _updateProjections, _exec };
})();
