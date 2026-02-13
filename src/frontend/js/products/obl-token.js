/**
 * OBELISK TOKEN (OBL) - Native Platform Token
 *
 * Features:
 * - Staking with APY rewards
 * - Fee discounts for holders
 * - Governance rights (future)
 * - Tokenomics tracking
 */

const OBLToken = {
    // ============================================
    // TOKEN INFO
    // ============================================
    token: {
        name: 'Obelisk Token',
        symbol: 'OBL',
        decimals: 18,
        totalSupply: 100_000_000, // 100M
        circulatingSupply: 0,
        contract: null, // Set after deployment
        chain: 'arbitrum',
        chainId: 42161,
        launched: false,
        launchDate: null
    },

    // ============================================
    // TOKENOMICS DISTRIBUTION
    // ============================================
    distribution: {
        community: 40,      // 40% - Community rewards, staking
        team: 15,           // 15% - Team (2yr vesting)
        treasury: 20,       // 20% - DAO Treasury
        liquidity: 15,      // 15% - DEX Liquidity
        investors: 10       // 10% - Early investors (1yr cliff)
    },

    // ============================================
    // STAKING CONFIGURATION
    // ============================================
    staking: {
        apy: 12.0,           // 12% APY for staking OBL
        totalStaked: 0,
        totalStakers: 0,
        minStake: 100,       // Min 100 OBL
        lockPeriods: [
            { days: 30, multiplier: 1.0, label: '1 Month' },
            { days: 90, multiplier: 1.5, label: '3 Months' },
            { days: 180, multiplier: 2.0, label: '6 Months' },
            { days: 365, multiplier: 3.0, label: '1 Year' }
        ]
    },

    // ============================================
    // FEE DISCOUNT TIERS
    // ============================================
    feeDiscounts: {
        tiers: [
            { minOBL: 100, discount: 0.10, label: 'Bronze', color: '#CD7F32' },
            { minOBL: 1000, discount: 0.25, label: 'Silver', color: '#C0C0C0' },
            { minOBL: 10000, discount: 0.50, label: 'Gold', color: '#FFD700' },
            { minOBL: 100000, discount: 0.75, label: 'Platinum', color: '#E5E4E2' }
        ]
    },

    // ============================================
    // USER STATE (simulated until contract)
    // ============================================
    userBalance: 0,
    userStaked: 0,
    userStakes: [], // Array of stake objects
    userTier: null,

    // ============================================
    // PRICE DATA (from backend)
    // ============================================
    price: 0.10,
    priceHistory: [],
    marketCap: 0,
    volume24h: 0,

    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        console.log('[OBLToken] Initializing...');
        this.loadState();
        this.updateFromBackend();
        this.startPriceUpdates();
        console.log('[OBLToken] Ready');
    },

    // ============================================
    // FEE DISCOUNT CALCULATION
    // ============================================

    /**
     * Get fee discount percentage for given OBL balance
     * @param {number} oblBalance - User's OBL balance
     * @returns {number} Discount percentage (0 to 0.75)
     */
    getFeeDiscount(oblBalance) {
        let discount = 0;
        let tier = null;

        // Find highest tier user qualifies for
        for (const t of this.feeDiscounts.tiers) {
            if (oblBalance >= t.minOBL) {
                discount = t.discount;
                tier = t;
            }
        }

        this.userTier = tier;
        return discount;
    },

    /**
     * Get user's current tier
     * @returns {object|null} Tier object or null
     */
    getCurrentTier() {
        return this.getFeeDiscount(this.userBalance), this.userTier;
    },

    // ============================================
    // STAKING OPERATIONS
    // ============================================

    /**
     * Stake OBL tokens
     * @param {number} amount - Amount to stake
     * @param {number} lockDays - Lock period in days
     * @returns {object} Stake result
     */
    stake(amount, lockDays) {
        if (amount < this.staking.minStake) {
            return { success: false, error: `Minimum stake is ${this.staking.minStake} OBL` };
        }

        if (amount > this.userBalance) {
            return { success: false, error: 'Insufficient balance' };
        }

        // Find lock period
        const lockPeriod = this.staking.lockPeriods.find(p => p.days === lockDays);
        if (!lockPeriod) {
            return { success: false, error: 'Invalid lock period' };
        }

        // Create stake
        const stake = {
            id: Date.now(),
            amount: amount,
            lockDays: lockDays,
            multiplier: lockPeriod.multiplier,
            startTime: Date.now(),
            endTime: Date.now() + (lockDays * 24 * 60 * 60 * 1000),
            rewardsClaimed: 0,
            active: true
        };

        // Update balances
        this.userBalance -= amount;
        this.userStaked += amount;
        this.userStakes.push(stake);
        this.staking.totalStaked += amount;
        this.staking.totalStakers++;

        this.saveState();
        this.updateBackend();

        console.log(`[OBLToken] Staked ${amount} OBL for ${lockDays} days`);

        return { success: true, stake };
    },

    /**
     * Unstake OBL tokens
     * @param {number} stakeId - Stake ID to unstake
     * @returns {object} Unstake result
     */
    unstake(stakeId) {
        const stake = this.userStakes.find(s => s.id === stakeId && s.active);

        if (!stake) {
            return { success: false, error: 'Stake not found' };
        }

        const now = Date.now();

        // Check if lock period ended
        if (now < stake.endTime) {
            const remainingDays = Math.ceil((stake.endTime - now) / (24 * 60 * 60 * 1000));
            return {
                success: false,
                error: `Stake is still locked for ${remainingDays} days`
            };
        }

        // Calculate final rewards
        const rewards = this.calculateStakeRewards(stake);

        // Update balances
        this.userBalance += stake.amount + rewards;
        this.userStaked -= stake.amount;
        stake.active = false;
        this.staking.totalStaked -= stake.amount;
        this.staking.totalStakers--;

        this.saveState();
        this.updateBackend();

        console.log(`[OBLToken] Unstaked ${stake.amount} OBL + ${rewards.toFixed(2)} rewards`);

        return {
            success: true,
            amount: stake.amount,
            rewards: rewards,
            total: stake.amount + rewards
        };
    },

    /**
     * Calculate staking rewards for a stake
     * @param {object} stake - Stake object
     * @returns {number} Rewards amount
     */
    calculateStakeRewards(stake) {
        const now = Date.now();
        const stakingTime = Math.min(now, stake.endTime) - stake.startTime;
        const stakingDays = stakingTime / (24 * 60 * 60 * 1000);

        // APY calculation with multiplier
        const effectiveAPY = this.staking.apy * stake.multiplier;
        const rewards = (stake.amount * effectiveAPY / 100) * (stakingDays / 365);

        return rewards - stake.rewardsClaimed;
    },

    /**
     * Get total pending rewards for user
     * @returns {number} Total pending rewards
     */
    getStakingRewards() {
        let totalRewards = 0;

        for (const stake of this.userStakes) {
            if (stake.active) {
                totalRewards += this.calculateStakeRewards(stake);
            }
        }

        return totalRewards;
    },

    // ============================================
    // BACKEND SYNC
    // ============================================

    async updateFromBackend() {
        try {
            const response = await fetch('http://localhost:3001/api/obl/info');
            if (response.ok) {
                const data = await response.json();
                this.price = data.price;
                this.marketCap = data.marketCap;
                this.volume24h = data.volume24h;
                this.staking.totalStaked = data.totalStaked;
            }
        } catch (error) {
            console.warn('[OBLToken] Backend not available, using local data');
        }
    },

    async updateBackend() {
        try {
            await fetch('http://localhost:3001/api/obl/stake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalStaked: this.staking.totalStaked,
                    totalStakers: this.staking.totalStakers
                })
            });
        } catch (error) {
            console.warn('[OBLToken] Failed to sync with backend');
        }
    },

    startPriceUpdates() {
        // Update price every minute
        setInterval(() => {
            this.updateFromBackend();
        }, 60000);
    },

    // ============================================
    // UI RENDERING
    // ============================================

    /**
     * Render full token dashboard
     * @param {string} containerId - Container element ID
     */
    renderDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const discount = this.getFeeDiscount(this.userBalance);
        const tier = this.userTier;
        const rewards = this.getStakingRewards();

        container.innerHTML = `
            <div class="obl-dashboard" style="
                background: linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%);
                border: 1px solid #30363d;
                border-radius: 12px;
                padding: 24px;
                color: #c9d1d9;
            ">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <div>
                        <h2 style="margin: 0; color: #ffd700; font-size: 28px;">
                            💎 ${this.token.symbol} Token
                        </h2>
                        <p style="margin: 4px 0 0 0; color: #8b949e; font-size: 14px;">
                            ${this.token.name} - Native Platform Token
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 32px; font-weight: bold; color: #00ff88;">
                            $${this.price.toFixed(4)}
                        </div>
                        <div style="font-size: 12px; color: #8b949e;">
                            Market Cap: $${(this.marketCap / 1000000).toFixed(2)}M
                        </div>
                    </div>
                </div>

                <!-- User Balances -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                    <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px;">
                        <div style="color: #8b949e; font-size: 12px; margin-bottom: 4px;">Available Balance</div>
                        <div style="font-size: 24px; font-weight: bold; color: #00ff88;">
                            ${this.userBalance.toLocaleString()} OBL
                        </div>
                        <div style="color: #8b949e; font-size: 11px;">
                            ≈ $${(this.userBalance * this.price).toFixed(2)}
                        </div>
                    </div>

                    <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px;">
                        <div style="color: #8b949e; font-size: 12px; margin-bottom: 4px;">Staked Balance</div>
                        <div style="font-size: 24px; font-weight: bold; color: #ffd700;">
                            ${this.userStaked.toLocaleString()} OBL
                        </div>
                        <div style="color: #8b949e; font-size: 11px;">
                            ≈ $${(this.userStaked * this.price).toFixed(2)}
                        </div>
                    </div>

                    <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px;">
                        <div style="color: #8b949e; font-size: 12px; margin-bottom: 4px;">Pending Rewards</div>
                        <div style="font-size: 24px; font-weight: bold; color: #58a6ff;">
                            ${rewards.toFixed(2)} OBL
                        </div>
                        <div style="color: #8b949e; font-size: 11px;">
                            ≈ $${(rewards * this.price).toFixed(2)}
                        </div>
                    </div>

                    <div style="background: ${tier ? 'linear-gradient(135deg, ' + tier.color + '22, #161b22)' : '#161b22'};
                                border: 1px solid ${tier ? tier.color : '#30363d'};
                                border-radius: 8px; padding: 16px;">
                        <div style="color: #8b949e; font-size: 12px; margin-bottom: 4px;">Fee Tier</div>
                        <div style="font-size: 24px; font-weight: bold; color: ${tier ? tier.color : '#8b949e'};">
                            ${tier ? tier.label : 'None'}
                        </div>
                        <div style="color: #00ff88; font-size: 11px;">
                            ${discount > 0 ? (discount * 100).toFixed(0) + '% discount' : 'Hold 100+ OBL'}
                        </div>
                    </div>
                </div>

                <!-- Distribution Chart -->
                <div style="margin-bottom: 32px;">
                    <h3 style="color: #c9d1d9; margin-bottom: 16px;">Token Distribution</h3>
                    <canvas id="obl-distribution-chart" width="800" height="200"></canvas>
                </div>

                <!-- Staking Interface -->
                <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="color: #c9d1d9; margin-top: 0;">Stake OBL Tokens</h3>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label style="display: block; color: #8b949e; font-size: 12px; margin-bottom: 8px;">
                                Amount to Stake
                            </label>
                            <input type="number" id="obl-stake-amount"
                                   placeholder="Min ${this.staking.minStake} OBL"
                                   style="width: 100%; padding: 12px; background: #0d1117;
                                          border: 1px solid #30363d; border-radius: 6px;
                                          color: #c9d1d9; font-size: 16px;">
                        </div>

                        <div>
                            <label style="display: block; color: #8b949e; font-size: 12px; margin-bottom: 8px;">
                                Lock Period
                            </label>
                            <select id="obl-lock-period" style="width: 100%; padding: 12px;
                                    background: #0d1117; border: 1px solid #30363d;
                                    border-radius: 6px; color: #c9d1d9; font-size: 16px;">
                                ${this.staking.lockPeriods.map(p => `
                                    <option value="${p.days}">
                                        ${p.label} (${p.multiplier}x multiplier - ${(this.staking.apy * p.multiplier).toFixed(1)}% APY)
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <button id="obl-stake-btn" style="
                        width: 100%; padding: 14px; background: linear-gradient(135deg, #00ff88, #00cc6a);
                        border: none; border-radius: 8px; color: #0d1117; font-size: 16px;
                        font-weight: bold; cursor: pointer; transition: all 0.3s;
                    " onmouseover="this.style.transform='scale(1.02)'"
                       onmouseout="this.style.transform='scale(1)'">
                        Stake OBL
                    </button>
                </div>

                <!-- Active Stakes -->
                <div id="obl-active-stakes">
                    ${this.renderActiveStakes()}
                </div>

                <!-- Fee Discount Tiers -->
                <div>
                    <h3 style="color: #c9d1d9; margin-bottom: 16px;">Fee Discount Tiers</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        ${this.feeDiscounts.tiers.map(t => `
                            <div style="
                                background: ${this.userBalance >= t.minOBL ? 'linear-gradient(135deg, ' + t.color + '22, #161b22)' : '#161b22'};
                                border: 2px solid ${this.userBalance >= t.minOBL ? t.color : '#30363d'};
                                border-radius: 8px; padding: 16px; text-align: center;
                            ">
                                <div style="font-size: 18px; font-weight: bold; color: ${t.color}; margin-bottom: 4px;">
                                    ${t.label}
                                </div>
                                <div style="color: #8b949e; font-size: 12px; margin-bottom: 8px;">
                                    ${t.minOBL.toLocaleString()} OBL
                                </div>
                                <div style="color: #00ff88; font-size: 20px; font-weight: bold;">
                                    ${(t.discount * 100).toFixed(0)}% OFF
                                </div>
                                ${this.userBalance >= t.minOBL ?
                                    '<div style="color: #00ff88; font-size: 11px; margin-top: 4px;">✓ UNLOCKED</div>' :
                                    '<div style="color: #8b949e; font-size: 11px; margin-top: 4px;">LOCKED</div>'
                                }
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Attach event listeners
        this.attachStakeListeners();

        // Draw distribution chart
        this.drawDistributionChart();
    },

    renderActiveStakes() {
        const activeStakes = this.userStakes.filter(s => s.active);

        if (activeStakes.length === 0) {
            return `
                <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px;
                            padding: 24px; text-align: center; color: #8b949e;">
                    No active stakes. Start staking to earn rewards!
                </div>
            `;
        }

        return `
            <div>
                <h3 style="color: #c9d1d9; margin-bottom: 16px;">Active Stakes</h3>
                ${activeStakes.map(stake => {
                    const rewards = this.calculateStakeRewards(stake);
                    const progress = Math.min(100, ((Date.now() - stake.startTime) / (stake.endTime - stake.startTime)) * 100);
                    const canUnstake = Date.now() >= stake.endTime;

                    return `
                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px;
                                    padding: 16px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                <div>
                                    <div style="color: #c9d1d9; font-size: 18px; font-weight: bold;">
                                        ${stake.amount.toLocaleString()} OBL
                                    </div>
                                    <div style="color: #8b949e; font-size: 12px;">
                                        Lock: ${stake.lockDays} days • ${stake.multiplier}x multiplier
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="color: #00ff88; font-size: 16px; font-weight: bold;">
                                        +${rewards.toFixed(2)} OBL
                                    </div>
                                    <div style="color: #8b949e; font-size: 11px;">
                                        Rewards
                                    </div>
                                </div>
                            </div>

                            <div style="background: #0d1117; border-radius: 4px; height: 8px; overflow: hidden; margin-bottom: 12px;">
                                <div style="background: ${canUnstake ? '#00ff88' : '#ffd700'};
                                            height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="color: #8b949e; font-size: 11px;">
                                    ${canUnstake ? 'Ready to unstake!' :
                                      'Ends ' + new Date(stake.endTime).toLocaleDateString()}
                                </div>

                                ${canUnstake ? `
                                    <button class="obl-unstake-btn" data-stake-id="${stake.id}" style="
                                        padding: 8px 16px; background: #00ff88; border: none;
                                        border-radius: 6px; color: #0d1117; font-weight: bold;
                                        cursor: pointer; font-size: 12px;
                                    ">
                                        Unstake
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    drawDistributionChart() {
        const canvas = document.getElementById('obl-distribution-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, width, height);

        // Distribution data
        const data = [
            { label: 'Community', value: this.distribution.community, color: '#00ff88' },
            { label: 'Treasury', value: this.distribution.treasury, color: '#ffd700' },
            { label: 'Liquidity', value: this.distribution.liquidity, color: '#58a6ff' },
            { label: 'Team', value: this.distribution.team, color: '#f85149' },
            { label: 'Investors', value: this.distribution.investors, color: '#a371f7' }
        ];

        // Draw bars
        const barWidth = width / data.length;
        const maxValue = Math.max(...data.map(d => d.value));

        data.forEach((item, i) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            const x = i * barWidth + 10;
            const y = height - barHeight - 40;

            // Draw bar
            ctx.fillStyle = item.color;
            ctx.fillRect(x, y, barWidth - 20, barHeight);

            // Draw label
            ctx.fillStyle = '#c9d1d9';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + (barWidth - 20) / 2, height - 20);

            // Draw percentage
            ctx.fillStyle = item.color;
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(item.value + '%', x + (barWidth - 20) / 2, y - 10);
        });
    },

    attachStakeListeners() {
        // Stake button
        const stakeBtn = document.getElementById('obl-stake-btn');
        if (stakeBtn) {
            stakeBtn.onclick = () => {
                const amount = parseFloat(document.getElementById('obl-stake-amount').value);
                const lockDays = parseInt(document.getElementById('obl-lock-period').value);

                if (!amount || amount <= 0) {
                    alert('Please enter a valid amount');
                    return;
                }

                const result = this.stake(amount, lockDays);

                if (result.success) {
                    alert(`Successfully staked ${amount} OBL for ${lockDays} days!`);
                    this.renderDashboard('obl-token-dashboard'); // Re-render
                } else {
                    alert('Error: ' + result.error);
                }
            };
        }

        // Unstake buttons
        document.querySelectorAll('.obl-unstake-btn').forEach(btn => {
            btn.onclick = () => {
                const stakeId = parseInt(btn.dataset.stakeId);
                const result = this.unstake(stakeId);

                if (result.success) {
                    alert(`Successfully unstaked! Received ${result.total.toFixed(2)} OBL (${result.amount} principal + ${result.rewards.toFixed(2)} rewards)`);
                    this.renderDashboard('obl-token-dashboard'); // Re-render
                } else {
                    alert('Error: ' + result.error);
                }
            };
        });
    },

    /**
     * Render token info card (compact widget)
     */
    renderTokenCard() {
        const discount = this.getFeeDiscount(this.userBalance);
        const tier = this.userTier;

        return `
            <div class="obl-token-card" style="
                background: linear-gradient(135deg, #161b22, #0d1117);
                border: 1px solid ${tier ? tier.color : '#30363d'};
                border-radius: 12px;
                padding: 16px;
                color: #c9d1d9;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="font-size: 32px; margin-right: 12px;">💎</div>
                    <div>
                        <div style="font-size: 18px; font-weight: bold; color: #ffd700;">
                            OBL Token
                        </div>
                        <div style="font-size: 20px; color: #00ff88;">
                            $${this.price.toFixed(4)}
                        </div>
                    </div>
                </div>

                <div style="background: #0d1117; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: #8b949e; font-size: 12px;">Your Balance:</span>
                        <span style="color: #00ff88; font-weight: bold;">${this.userBalance.toLocaleString()} OBL</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #8b949e; font-size: 12px;">Fee Tier:</span>
                        <span style="color: ${tier ? tier.color : '#8b949e'}; font-weight: bold;">
                            ${tier ? tier.label + ' (-' + (discount * 100).toFixed(0) + '%)' : 'None'}
                        </span>
                    </div>
                </div>

                <button onclick="OBLToken.renderDashboard('main-content')" style="
                    width: 100%; padding: 10px; background: linear-gradient(135deg, #ffd700, #ffed4e);
                    border: none; border-radius: 6px; color: #0d1117; font-weight: bold;
                    cursor: pointer; font-size: 14px;
                ">
                    Open OBL Dashboard
                </button>
            </div>
        `;
    },

    // ============================================
    // STATE PERSISTENCE
    // ============================================

    saveState() {
        const state = {
            userBalance: this.userBalance,
            userStaked: this.userStaked,
            userStakes: this.userStakes,
            staking: this.staking,
            lastUpdate: Date.now()
        };

        localStorage.setItem('obl_token_state', JSON.stringify(state));
    },

    loadState() {
        const saved = localStorage.getItem('obl_token_state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.userBalance = state.userBalance || 0;
                this.userStaked = state.userStaked || 0;
                this.userStakes = state.userStakes || [];
                if (state.staking) {
                    this.staking.totalStaked = state.staking.totalStaked || 0;
                    this.staking.totalStakers = state.staking.totalStakers || 0;
                }
                console.log('[OBLToken] State loaded from localStorage');
            } catch (error) {
                console.error('[OBLToken] Failed to load state:', error);
            }
        }
    },

    /**
     * Add OBL to user balance (for testing)
     */
    addBalance(amount) {
        this.userBalance += amount;
        this.saveState();
        console.log(`[OBLToken] Added ${amount} OBL to balance. New balance: ${this.userBalance}`);
    }
};

// Auto-initialize
if (typeof window !== 'undefined') {
    window.OBLToken = OBLToken;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => OBLToken.init());
    } else {
        OBLToken.init();
    }
}

// Export for Node.js
if (typeof module !== 'undefined') {
    module.exports = OBLToken;
}
