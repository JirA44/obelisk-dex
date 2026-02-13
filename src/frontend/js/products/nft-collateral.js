/**
 * NFT COLLATERAL LOANS - Borrow Against NFTs
 * Use NFTs as collateral for instant loans
 */
const NFTCollateralModule = {
    loans: [],
    nfts: [],

    collections: [
        { id: 'bayc', name: 'Bored Ape YC', icon: '🦍', floor: 28.5, ltv: 50 },
        { id: 'punks', name: 'CryptoPunks', icon: '👾', floor: 48.2, ltv: 55 },
        { id: 'azuki', name: 'Azuki', icon: '🎭', floor: 6.8, ltv: 45 },
        { id: 'doodles', name: 'Doodles', icon: '🌈', floor: 2.1, ltv: 40 },
        { id: 'moonbirds', name: 'Moonbirds', icon: '🦉', floor: 1.2, ltv: 35 },
        { id: 'pudgy', name: 'Pudgy Penguins', icon: '🐧', floor: 8.5, ltv: 45 },
        { id: 'milady', name: 'Milady', icon: '👧', floor: 3.2, ltv: 40 },
        { id: 'degods', name: 'DeGods', icon: '⚡', floor: 4.8, ltv: 42 }
    ],

    interestRates: {
        '7': 15,
        '14': 12,
        '30': 10,
        '90': 8
    },

    init() {
        this.loans = JSON.parse(localStorage.getItem('obelisk_nft_loans') || '[]');
        this.nfts = JSON.parse(localStorage.getItem('obelisk_user_nfts') || '[]');
    },

    save() {
        localStorage.setItem('obelisk_nft_loans', JSON.stringify(this.loans));
        localStorage.setItem('obelisk_user_nfts', JSON.stringify(this.nfts));
    },

    addMockNFT(collectionId) {
        const collection = this.collections.find(c => c.id === collectionId);
        if (!collection) return;

        const nft = {
            id: 'nft-' + Date.now(),
            collection: collectionId,
            collectionName: collection.name,
            tokenId: Math.floor(Math.random() * 10000),
            icon: collection.icon,
            floor: collection.floor,
            ltv: collection.ltv,
            addedAt: Date.now()
        };

        this.nfts.push(nft);
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`🖼️ Added ${collection.name} #${nft.tokenId} to vault`, 'success');
        }
    },

    createLoan(nftId, duration) {
        const nft = this.nfts.find(n => n.id === nftId);
        if (!nft) return;

        const ethPrice = 2650;
        const loanAmount = (nft.floor * ethPrice * nft.ltv / 100);
        const interestRate = this.interestRates[duration] || 10;

        const loan = {
            id: 'loan-' + Date.now(),
            nftId,
            nftName: `${nft.collectionName} #${nft.tokenId}`,
            nftIcon: nft.icon,
            collateral: nft.floor,
            loanAmount,
            currency: 'USDC',
            duration: parseInt(duration),
            interestRate,
            totalRepay: loanAmount * (1 + (interestRate / 100) * (duration / 365)),
            startDate: Date.now(),
            endDate: Date.now() + (duration * 86400000),
            status: 'active'
        };

        this.loans.push(loan);
        this.nfts = this.nfts.filter(n => n.id !== nftId);
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`💰 Loan created: $${loanAmount.toFixed(0)} at ${interestRate}% APR`, 'success');
        }

        return loan;
    },

    repayLoan(loanId) {
        const loan = this.loans.find(l => l.id === loanId);
        if (!loan) return;

        loan.status = 'repaid';
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`✅ Loan repaid! NFT returned to your wallet`, 'success');
        }
    },

    getStats() {
        const activeLoans = this.loans.filter(l => l.status === 'active');
        const totalBorrowed = activeLoans.reduce((sum, l) => sum + l.loanAmount, 0);
        const totalCollateral = activeLoans.reduce((sum, l) => sum + l.collateral * 2650, 0);

        return {
            activeLoans: activeLoans.length,
            totalBorrowed,
            totalCollateral,
            nftsInVault: this.nfts.length
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const ethPrice = 2650;

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">🖼️ NFT Collateral Loans</h2>
                <p style="color:#888;margin-bottom:20px;">Borrow against your NFTs • Instant liquidity • Keep your JPEGs</p>

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Active Loans</div>
                        <div style="color:#00ff88;font-size:24px;font-weight:bold;">${stats.activeLoans}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Borrowed</div>
                        <div style="color:#00aaff;font-size:24px;font-weight:bold;">$${stats.totalBorrowed.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Collateral Value</div>
                        <div style="color:#a855f7;font-size:24px;font-weight:bold;">$${stats.totalCollateral.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">NFTs in Vault</div>
                        <div style="color:#ffaa00;font-size:24px;font-weight:bold;">${stats.nftsInVault}</div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <!-- Supported Collections -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📚 Supported Collections</h3>
                        <div style="display:grid;gap:8px;max-height:300px;overflow-y:auto;">
                            ${this.collections.map(col => `
                                <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;">
                                    <div style="display:flex;align-items:center;gap:10px;">
                                        <span style="font-size:24px;">${col.icon}</span>
                                        <div>
                                            <div style="color:#fff;font-weight:500;">${col.name}</div>
                                            <div style="color:#888;font-size:11px;">Floor: ${col.floor} ETH</div>
                                        </div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="color:#00ff88;font-weight:bold;">${col.ltv}% LTV</div>
                                        <div style="color:#888;font-size:11px;">~$${(col.floor * ethPrice * col.ltv / 100).toFixed(0)} max</div>
                                    </div>
                                    <button onclick="NFTCollateralModule.addMockNFT('${col.id}');NFTCollateralModule.render('${containerId}')"
                                            style="padding:4px 8px;background:rgba(0,170,255,0.2);border:1px solid rgba(0,170,255,0.4);border-radius:4px;color:#00aaff;cursor:pointer;font-size:10px;">
                                        + Add
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Your NFTs -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">🏦 Your NFT Vault</h3>
                        ${this.nfts.length === 0 ? `
                            <div style="text-align:center;padding:40px;color:#888;">
                                <div style="font-size:48px;margin-bottom:16px;">🖼️</div>
                                <div>No NFTs in vault</div>
                                <div style="font-size:12px;margin-top:8px;">Add NFTs from supported collections</div>
                            </div>
                        ` : `
                            <div style="display:grid;gap:10px;">
                                ${this.nfts.map(nft => `
                                    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                            <div style="display:flex;align-items:center;gap:8px;">
                                                <span style="font-size:20px;">${nft.icon}</span>
                                                <div>
                                                    <div style="color:#fff;font-weight:500;">${nft.collectionName} #${nft.tokenId}</div>
                                                    <div style="color:#888;font-size:11px;">${nft.floor} ETH (~$${(nft.floor * ethPrice).toFixed(0)})</div>
                                                </div>
                                            </div>
                                            <div style="color:#00ff88;font-weight:bold;">${nft.ltv}% LTV</div>
                                        </div>
                                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
                                            ${Object.entries(this.interestRates).map(([days, rate]) => `
                                                <button onclick="NFTCollateralModule.createLoan('${nft.id}', ${days});NFTCollateralModule.render('${containerId}')"
                                                        style="padding:6px;background:rgba(0,255,136,0.2);border:1px solid rgba(0,255,136,0.4);border-radius:4px;color:#00ff88;cursor:pointer;font-size:10px;">
                                                    ${days}d @ ${rate}%
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>

                <!-- Active Loans -->
                ${this.loans.filter(l => l.status === 'active').length > 0 ? `
                    <div style="margin-top:20px;background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <h3 style="color:#fff;margin-bottom:16px;">📋 Active Loans</h3>
                        <div style="display:grid;gap:10px;">
                            ${this.loans.filter(l => l.status === 'active').map(loan => {
                                const daysLeft = Math.max(0, Math.ceil((loan.endDate - Date.now()) / 86400000));
                                return `
                                    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:12px;align-items:center;">
                                        <div style="display:flex;align-items:center;gap:8px;">
                                            <span>${loan.nftIcon}</span>
                                            <div style="color:#fff;">${loan.nftName}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <div style="color:#888;font-size:10px;">Borrowed</div>
                                            <div style="color:#00ff88;font-weight:bold;">$${loan.loanAmount.toFixed(0)}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <div style="color:#888;font-size:10px;">Repay</div>
                                            <div style="color:#ffaa00;font-weight:bold;">$${loan.totalRepay.toFixed(0)}</div>
                                        </div>
                                        <div style="text-align:center;">
                                            <div style="color:#888;font-size:10px;">Days Left</div>
                                            <div style="color:${daysLeft < 3 ? '#ff4444' : '#fff'};font-weight:bold;">${daysLeft}d</div>
                                        </div>
                                        <button onclick="NFTCollateralModule.repayLoan('${loan.id}');NFTCollateralModule.render('${containerId}')"
                                                style="padding:6px 12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:11px;">
                                            Repay
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => NFTCollateralModule.init());
window.NFTCollateralModule = NFTCollateralModule;
