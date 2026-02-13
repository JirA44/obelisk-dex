/**
 * OBELISK DEX - Obelisk Academy
 * Interactive Learning System with i18n support
 */

const ObeliskAcademy = {
    // Get current language
    getLang() {
        return localStorage.getItem('obelisk-lang') || 'en';
    },

    // Course content with translations
    coursesData: {
        en: {
        'getting-started': {
            title: 'Getting Started',
            lessons: [
                {
                    title: 'Welcome to Obelisk DEX',
                    content: `
                        <h3>Welcome, Reclaimer</h3>
                        <p>Obelisk DEX is a <strong>decentralized exchange</strong> (DEX) that allows you to trade cryptocurrencies directly from your wallet, without intermediaries.</p>
                        <p>Key principles:</p>
                        <ul>
                            <li><strong>Non-Custodial:</strong> You control your private keys. We never hold your funds.</li>
                            <li><strong>Post-Quantum Secure:</strong> Protected against future quantum computer attacks.</li>
                            <li><strong>Transparent:</strong> All trades happen on-chain with full visibility.</li>
                        </ul>
                        <p>Unlike centralized exchanges (CEX) like Binance or Coinbase, no one can freeze your account or deny withdrawals.</p>
                    `
                },
                {
                    title: 'Connecting Your Wallet',
                    content: `
                        <h3>Connect Your Wallet</h3>
                        <p>To use Obelisk DEX, you need a Web3 wallet. We recommend:</p>
                        <ul>
                            <li><strong>MetaMask:</strong> Most popular browser extension wallet</li>
                            <li><strong>WalletConnect:</strong> Connect any mobile wallet</li>
                            <li><strong>Rabby:</strong> Multi-chain focused wallet</li>
                        </ul>
                        <p>Steps to connect:</p>
                        <ol>
                            <li>Click the "Connect Wallet" button in the top right</li>
                            <li>Select your wallet provider</li>
                            <li>Approve the connection in your wallet</li>
                            <li>You're ready to trade!</li>
                        </ol>
                        <p><strong>Security tip:</strong> Never share your seed phrase with anyone. Obelisk will NEVER ask for it.</p>
                    `
                },
                {
                    title: 'Interface Overview',
                    content: `
                        <h3>Navigating the Interface</h3>
                        <p>The Obelisk interface is divided into several sections:</p>
                        <ul>
                            <li><strong>Trade:</strong> Execute market and limit orders with leverage</li>
                            <li><strong>Swap:</strong> Simple token swaps without leverage</li>
                            <li><strong>Banking:</strong> Deposit, earn interest, borrow against collateral</li>
                            <li><strong>Bonds:</strong> Fixed-income investment products</li>
                            <li><strong>Wallet:</strong> View balances and transaction history</li>
                            <li><strong>Portfolio:</strong> Track your positions and P&L</li>
                        </ul>
                        <p>Use the tabs at the top to navigate between sections.</p>
                    `
                },
                {
                    title: 'Understanding Gas Fees',
                    content: `
                        <h3>Gas Fees Explained</h3>
                        <p>Every transaction on Ethereum/Arbitrum requires <strong>gas</strong> - a small fee paid to network validators.</p>
                        <p>Key concepts:</p>
                        <ul>
                            <li><strong>Gas Price:</strong> Cost per unit of computation (in Gwei)</li>
                            <li><strong>Gas Limit:</strong> Maximum units of gas for a transaction</li>
                            <li><strong>Total Cost:</strong> Gas Price x Gas Used</li>
                        </ul>
                        <p>Obelisk operates on <strong>Arbitrum</strong>, an Ethereum Layer 2 network with significantly lower gas fees (typically $0.01-0.10 per transaction).</p>
                        <p><strong>Tip:</strong> Always have some ETH in your wallet to pay for gas.</p>
                    `
                },
                {
                    title: 'Demo Mode',
                    content: `
                        <h3>Practice with Demo Mode</h3>
                        <p>Before risking real funds, practice with our Demo Mode:</p>
                        <ul>
                            <li>Get $10,000 in virtual funds</li>
                            <li>Execute trades without real risk</li>
                            <li>Learn the interface and strategies</li>
                            <li>Track your performance</li>
                        </ul>
                        <p>To enable Demo Mode, go to Settings and toggle "Demo Mode" on.</p>
                        <p><strong>Important:</strong> Demo trades are simulated. Real trading involves real financial risk.</p>
                    `
                }
            ]
        },

        'trading-fundamentals': {
            title: 'Trading Fundamentals',
            lessons: [
                {
                    title: 'Market Orders',
                    content: `
                        <h3>Market Orders</h3>
                        <p>A market order executes <strong>immediately</strong> at the current market price.</p>
                        <p>When to use:</p>
                        <ul>
                            <li>You need to enter or exit a position quickly</li>
                            <li>The asset has high liquidity (tight spread)</li>
                            <li>Exact price is less important than speed</li>
                        </ul>
                        <p>Downsides:</p>
                        <ul>
                            <li><strong>Slippage:</strong> Your executed price may differ from what you saw</li>
                            <li>In volatile markets, slippage can be significant</li>
                        </ul>
                    `
                },
                {
                    title: 'Limit Orders',
                    content: `
                        <h3>Limit Orders</h3>
                        <p>A limit order only executes at your <strong>specified price or better</strong>.</p>
                        <p>When to use:</p>
                        <ul>
                            <li>You want to buy below current price (buy the dip)</li>
                            <li>You want to sell above current price (sell the rally)</li>
                            <li>You want price certainty over speed</li>
                        </ul>
                        <p>Key points:</p>
                        <ul>
                            <li>Order may never fill if price doesn't reach your level</li>
                            <li>Good for "set and forget" strategies</li>
                            <li>No slippage risk</li>
                        </ul>
                    `
                },
                {
                    title: 'Long vs Short Positions',
                    content: `
                        <h3>Going Long vs Short</h3>
                        <p><strong>Long Position:</strong> You profit when price goes UP</p>
                        <ul>
                            <li>Buy low, sell high</li>
                            <li>Traditional "investing" mindset</li>
                            <li>Maximum loss = your investment</li>
                        </ul>
                        <p><strong>Short Position:</strong> You profit when price goes DOWN</p>
                        <ul>
                            <li>Sell high, buy back low</li>
                            <li>Requires borrowing the asset</li>
                            <li>Theoretically unlimited loss (price can rise forever)</li>
                        </ul>
                        <p>Example: If BTC is $50,000 and drops to $45,000:</p>
                        <ul>
                            <li>Long position: -10% (loss)</li>
                            <li>Short position: +10% (profit)</li>
                        </ul>
                    `
                },
                {
                    title: 'Reading the Order Book',
                    content: `
                        <h3>Understanding the Order Book</h3>
                        <p>The order book shows all pending buy and sell orders:</p>
                        <ul>
                            <li><strong>Bids (Green):</strong> Buy orders - people want to buy at these prices</li>
                            <li><strong>Asks (Red):</strong> Sell orders - people want to sell at these prices</li>
                            <li><strong>Spread:</strong> Gap between highest bid and lowest ask</li>
                        </ul>
                        <p>Reading signals:</p>
                        <ul>
                            <li>Large bid walls = potential support level</li>
                            <li>Large ask walls = potential resistance level</li>
                            <li>Tight spread = high liquidity</li>
                            <li>Wide spread = low liquidity, beware slippage</li>
                        </ul>
                    `
                },
                {
                    title: 'Stop-Loss Orders',
                    content: `
                        <h3>Protecting with Stop-Loss</h3>
                        <p>A stop-loss automatically closes your position at a specified loss level.</p>
                        <p>Why use stop-losses:</p>
                        <ul>
                            <li>Limit your maximum loss per trade</li>
                            <li>Remove emotion from trading decisions</li>
                            <li>Protect against sudden market crashes</li>
                        </ul>
                        <p>Setting stop-losses:</p>
                        <ul>
                            <li>Place below support levels (for longs)</li>
                            <li>Place above resistance levels (for shorts)</li>
                            <li>Don't place at obvious round numbers (prone to stop hunts)</li>
                        </ul>
                        <p><strong>Rule of thumb:</strong> Never risk more than 2% of your portfolio on a single trade.</p>
                    `
                },
                {
                    title: 'Take-Profit Orders',
                    content: `
                        <h3>Locking in Profits</h3>
                        <p>A take-profit order automatically closes your position when it reaches a target profit.</p>
                        <p>Benefits:</p>
                        <ul>
                            <li>Lock in gains before reversal</li>
                            <li>No need to monitor charts 24/7</li>
                            <li>Prevents greed from erasing profits</li>
                        </ul>
                        <p>Strategy tips:</p>
                        <ul>
                            <li>Set at key resistance/support levels</li>
                            <li>Use multiple TPs (take 50% at target 1, rest at target 2)</li>
                            <li>Risk/Reward ratio should be at least 1:2</li>
                        </ul>
                    `
                },
                {
                    title: 'Trading Psychology',
                    content: `
                        <h3>Mastering Your Mindset</h3>
                        <p>The biggest enemy in trading is yourself. Common pitfalls:</p>
                        <ul>
                            <li><strong>FOMO:</strong> Chasing pumps, buying at the top</li>
                            <li><strong>Revenge Trading:</strong> Trying to recover losses immediately</li>
                            <li><strong>Overconfidence:</strong> Risking too much after wins</li>
                            <li><strong>Panic Selling:</strong> Exiting at the worst possible moment</li>
                        </ul>
                        <p>Rules to follow:</p>
                        <ol>
                            <li>Have a plan BEFORE entering any trade</li>
                            <li>Accept that losses are part of trading</li>
                            <li>Never trade with money you can't afford to lose</li>
                            <li>Take breaks after losing streaks</li>
                        </ol>
                    `
                }
            ]
        },

        'leverage-trading': {
            title: 'Understanding Leverage',
            lessons: [
                {
                    title: 'What is Leverage?',
                    content: `
                        <h3>Leverage Explained</h3>
                        <p>Leverage allows you to control a larger position with less capital.</p>
                        <p>Example with 10x leverage:</p>
                        <ul>
                            <li>You have $100</li>
                            <li>With 10x, you control $1,000 position</li>
                            <li>If price moves +10%, you gain +$100 (100% on your $100)</li>
                            <li>If price moves -10%, you lose -$100 (100% loss = liquidation)</li>
                        </ul>
                        <p>Leverage is a <strong>double-edged sword</strong>. It amplifies both gains AND losses.</p>
                    `
                },
                {
                    title: 'Margin and Collateral',
                    content: `
                        <h3>Understanding Margin</h3>
                        <p><strong>Margin</strong> = the collateral you put up to open a leveraged position.</p>
                        <p>Key terms:</p>
                        <ul>
                            <li><strong>Initial Margin:</strong> Minimum required to open position</li>
                            <li><strong>Maintenance Margin:</strong> Minimum required to keep position open</li>
                            <li><strong>Margin Ratio:</strong> Your margin / Position value</li>
                        </ul>
                        <p>Example:</p>
                        <ul>
                            <li>You deposit $100 as margin</li>
                            <li>Open 10x long = $1,000 position</li>
                            <li>If position value drops below $100, you're at risk</li>
                        </ul>
                    `
                },
                {
                    title: 'Liquidation Mechanics',
                    content: `
                        <h3>How Liquidation Works</h3>
                        <p>When your losses approach your margin, the exchange <strong>liquidates</strong> your position to prevent negative balance.</p>
                        <p>Liquidation formula (simplified):</p>
                        <code>Liquidation Price = Entry Price x (1 - 1/Leverage)</code>
                        <p>Example with 10x Long at $100:</p>
                        <ul>
                            <li>Liquidation = $100 x (1 - 0.1) = $90</li>
                            <li>If price drops to $90, you lose your entire margin</li>
                        </ul>
                        <p><strong>Important:</strong> Fees and funding rates can trigger liquidation earlier than expected.</p>
                    `
                },
                {
                    title: 'Isolated vs Cross Margin',
                    content: `
                        <h3>Margin Modes</h3>
                        <p><strong>Isolated Margin:</strong></p>
                        <ul>
                            <li>Risk limited to margin assigned to that position</li>
                            <li>If liquidated, only that position is lost</li>
                            <li>Good for risky trades with limited downside</li>
                        </ul>
                        <p><strong>Cross Margin:</strong></p>
                        <ul>
                            <li>Entire account balance used as margin</li>
                            <li>Positions share margin (one can save another)</li>
                            <li>Higher liquidation threshold, but risk entire account</li>
                        </ul>
                        <p><strong>Recommendation:</strong> Use Isolated Margin when learning.</p>
                    `
                },
                {
                    title: 'Funding Rates',
                    content: `
                        <h3>Perpetual Funding Rates</h3>
                        <p>Perpetual futures use <strong>funding rates</strong> to keep price aligned with spot.</p>
                        <p>How it works:</p>
                        <ul>
                            <li>Funding is exchanged between longs and shorts</li>
                            <li>Positive rate: Longs pay shorts</li>
                            <li>Negative rate: Shorts pay longs</li>
                            <li>Typically paid every 8 hours</li>
                        </ul>
                        <p>Impact on trading:</p>
                        <ul>
                            <li>High positive funding = market is very bullish (overheated)</li>
                            <li>High negative funding = market is very bearish</li>
                            <li>Long-term positions: factor funding into your strategy</li>
                        </ul>
                    `
                },
                {
                    title: 'Recommended Leverage Levels',
                    content: `
                        <h3>How Much Leverage to Use?</h3>
                        <p>Golden rules:</p>
                        <ul>
                            <li><strong>Beginners:</strong> 2x-3x maximum</li>
                            <li><strong>Intermediate:</strong> 5x-10x with strict risk management</li>
                            <li><strong>Advanced:</strong> 10x-20x only for scalping/quick trades</li>
                            <li><strong>Never:</strong> 50x-100x is gambling, not trading</li>
                        </ul>
                        <p>Consider:</p>
                        <ul>
                            <li>Higher leverage = tighter stop-loss needed</li>
                            <li>Volatile assets (memecoins) = lower leverage</li>
                            <li>Longer timeframes = lower leverage</li>
                        </ul>
                    `
                },
                {
                    title: 'Leverage Calculator',
                    content: `
                        <h3>Calculating Risk</h3>
                        <p>Before any leveraged trade, calculate:</p>
                        <ol>
                            <li><strong>Position Size:</strong> Margin x Leverage</li>
                            <li><strong>Liquidation Price:</strong> Entry x (1 - 1/Leverage) for longs</li>
                            <li><strong>Max Loss:</strong> Your entire margin</li>
                            <li><strong>Required Move for 2x:</strong> (100/Leverage)%</li>
                        </ol>
                        <p>Example: $100 at 10x on BTC at $50,000</p>
                        <ul>
                            <li>Position: $1,000</li>
                            <li>Liquidation: ~$45,000</li>
                            <li>10% move = $100 profit or loss</li>
                        </ul>
                    `
                },
                {
                    title: 'Common Mistakes to Avoid',
                    content: `
                        <h3>Leverage Pitfalls</h3>
                        <p>Avoid these common errors:</p>
                        <ul>
                            <li><strong>Overleveraging:</strong> Using max leverage "for bigger gains"</li>
                            <li><strong>No Stop-Loss:</strong> "It will come back" - famous last words</li>
                            <li><strong>Ignoring Funding:</strong> Positions eaten by funding over time</li>
                            <li><strong>Adding to Losers:</strong> "Averaging down" on leveraged positions</li>
                            <li><strong>Emotional Leverage:</strong> Increasing leverage after losses</li>
                        </ul>
                        <p><strong>Remember:</strong> The goal is to survive to trade another day.</p>
                    `
                }
            ]
        },

        'post-quantum': {
            title: 'Post-Quantum Security',
            lessons: [
                {
                    title: 'The Quantum Threat',
                    content: `
                        <h3>Why Quantum Computers Matter</h3>
                        <p>Current cryptography (RSA, ECDSA) can be broken by quantum computers using Shor's algorithm.</p>
                        <p>Timeline:</p>
                        <ul>
                            <li><strong>Now:</strong> Quantum computers are weak (hundreds of qubits)</li>
                            <li><strong>2030-2035:</strong> Experts predict "cryptographically relevant" quantum computers</li>
                            <li><strong>Harvest Now, Decrypt Later:</strong> Attackers can store encrypted data today and decrypt it later</li>
                        </ul>
                        <p>What's at risk:</p>
                        <ul>
                            <li>All Bitcoin/Ethereum private keys</li>
                            <li>Bank transactions</li>
                            <li>Government secrets</li>
                        </ul>
                    `
                },
                {
                    title: 'NIST Post-Quantum Standards',
                    content: `
                        <h3>The New Standard</h3>
                        <p>In 2024, NIST (US National Institute of Standards) standardized quantum-resistant algorithms:</p>
                        <ul>
                            <li><strong>FIPS 203 (ML-KEM):</strong> Key encapsulation based on CRYSTALS-Kyber</li>
                            <li><strong>FIPS 204 (ML-DSA):</strong> Digital signatures based on CRYSTALS-Dilithium</li>
                            <li><strong>FIPS 205 (SLH-DSA):</strong> Hash-based signatures based on SPHINCS+</li>
                        </ul>
                        <p>These algorithms are designed to be secure against both classical AND quantum computers.</p>
                    `
                },
                {
                    title: 'CRYSTALS-Kyber',
                    content: `
                        <h3>CRYSTALS-Kyber Explained</h3>
                        <p>Kyber is used for <strong>key encapsulation</strong> - securely exchanging encryption keys.</p>
                        <p>How it works:</p>
                        <ul>
                            <li>Based on the "Learning With Errors" (LWE) problem</li>
                            <li>Uses lattice-based cryptography</li>
                            <li>Finding the secret key is like finding a needle in a multi-dimensional haystack</li>
                        </ul>
                        <p>Security levels:</p>
                        <ul>
                            <li>Kyber-512: Equivalent to AES-128</li>
                            <li>Kyber-768: Equivalent to AES-192</li>
                            <li>Kyber-1024: Equivalent to AES-256</li>
                        </ul>
                        <p>Obelisk uses Kyber-1024 for maximum security.</p>
                    `
                },
                {
                    title: 'CRYSTALS-Dilithium',
                    content: `
                        <h3>CRYSTALS-Dilithium Explained</h3>
                        <p>Dilithium is used for <strong>digital signatures</strong> - proving you authorized a transaction.</p>
                        <p>How it works:</p>
                        <ul>
                            <li>Also based on lattice problems</li>
                            <li>Replaces ECDSA (used in Bitcoin/Ethereum)</li>
                            <li>Signing and verification are fast</li>
                        </ul>
                        <p>Why it matters for crypto:</p>
                        <ul>
                            <li>Every transaction requires a signature</li>
                            <li>If signatures can be forged, coins can be stolen</li>
                            <li>Dilithium makes forgery computationally impossible</li>
                        </ul>
                    `
                },
                {
                    title: 'SPHINCS+',
                    content: `
                        <h3>SPHINCS+ Backup Security</h3>
                        <p>SPHINCS+ is a <strong>hash-based signature</strong> scheme - the ultimate fallback.</p>
                        <p>Advantages:</p>
                        <ul>
                            <li>Based only on hash functions (very well understood)</li>
                            <li>No reliance on lattice assumptions</li>
                            <li>If lattice crypto is somehow broken, SPHINCS+ remains secure</li>
                        </ul>
                        <p>Trade-offs:</p>
                        <ul>
                            <li>Larger signatures (~8-50 KB vs ~2 KB for Dilithium)</li>
                            <li>Slower signing</li>
                            <li>Used for high-value, long-term security needs</li>
                        </ul>
                    `
                },
                {
                    title: 'How Obelisk Implements PQC',
                    content: `
                        <h3>Obelisk Security Architecture</h3>
                        <p>Obelisk implements a layered approach:</p>
                        <ol>
                            <li><strong>Key Exchange:</strong> CRYSTALS-Kyber for all communications</li>
                            <li><strong>Transaction Signing:</strong> CRYSTALS-Dilithium for all trades</li>
                            <li><strong>Backup Signatures:</strong> SPHINCS+ for critical operations</li>
                            <li><strong>Hybrid Mode:</strong> Classical + PQC for transition period</li>
                        </ol>
                        <p>Your private keys are generated using quantum-resistant randomness and stored only in your wallet.</p>
                    `
                },
                {
                    title: 'Wallet Security Best Practices',
                    content: `
                        <h3>Protecting Your Keys</h3>
                        <p>Even with PQC, your security depends on you:</p>
                        <ul>
                            <li><strong>Hardware Wallet:</strong> Use a Ledger/Trezor for significant funds</li>
                            <li><strong>Seed Phrase:</strong> Write on paper/metal, store in safe, NEVER digital</li>
                            <li><strong>Multiple Wallets:</strong> Separate hot wallet (trading) from cold storage</li>
                            <li><strong>Verify URLs:</strong> Bookmark official sites, never click links</li>
                        </ul>
                        <p>Red flags:</p>
                        <ul>
                            <li>Anyone asking for your seed phrase</li>
                            <li>"Wallet sync" or "validation" popups</li>
                            <li>Unsolicited DMs offering help</li>
                        </ul>
                    `
                },
                {
                    title: 'The Future of Crypto Security',
                    content: `
                        <h3>What Comes Next</h3>
                        <p>The crypto industry is transitioning to PQC:</p>
                        <ul>
                            <li><strong>Ethereum:</strong> Research into PQC integration</li>
                            <li><strong>Bitcoin:</strong> Discussions on soft fork for PQC</li>
                            <li><strong>Obelisk:</strong> Already quantum-secure</li>
                        </ul>
                        <p>Timeline predictions:</p>
                        <ul>
                            <li>2025-2027: Major protocols announce PQC roadmaps</li>
                            <li>2028-2030: Migration to hybrid (classical + PQC)</li>
                            <li>2030+: Full PQC adoption</li>
                        </ul>
                        <p>By using Obelisk, you're already ahead of the curve.</p>
                    `
                },
                {
                    title: 'Quiz: Test Your Knowledge',
                    content: `
                        <h3>Post-Quantum Security Quiz</h3>
                        <p>Answer these questions to test your understanding:</p>
                        <ol>
                            <li>What algorithm does quantum computing use to break RSA?<br><em>Answer: Shor's algorithm</em></li>
                            <li>What type of math does CRYSTALS-Kyber use?<br><em>Answer: Lattice-based cryptography (LWE)</em></li>
                            <li>What is CRYSTALS-Dilithium used for?<br><em>Answer: Digital signatures</em></li>
                            <li>Why is SPHINCS+ called a "backup"?<br><em>Answer: It's based on different math (hashes), so if lattices break, it still works</em></li>
                            <li>What's the "harvest now, decrypt later" threat?<br><em>Answer: Attackers store encrypted data today to decrypt with future quantum computers</em></li>
                        </ol>
                        <p>Congratulations! You now understand why post-quantum security matters.</p>
                    `
                }
            ]
        },

        'defi-strategies': {
            title: 'DeFi Strategies',
            lessons: [
                {
                    title: 'What is DeFi?',
                    content: `
                        <h3>Decentralized Finance Explained</h3>
                        <p>DeFi replaces traditional financial services with smart contracts:</p>
                        <ul>
                            <li><strong>Lending:</strong> Earn interest by lending crypto</li>
                            <li><strong>Borrowing:</strong> Borrow against collateral</li>
                            <li><strong>Trading:</strong> Swap tokens directly (DEXs)</li>
                            <li><strong>Yield Farming:</strong> Earn rewards for providing liquidity</li>
                        </ul>
                        <p>Benefits:</p>
                        <ul>
                            <li>24/7 availability</li>
                            <li>No credit checks or KYC</li>
                            <li>Permissionless access</li>
                            <li>Transparent and auditable</li>
                        </ul>
                    `
                },
                {
                    title: 'Yield Farming Basics',
                    content: `
                        <h3>How Yield Farming Works</h3>
                        <p>Yield farming = earning rewards for providing liquidity to protocols.</p>
                        <p>Common strategies:</p>
                        <ul>
                            <li><strong>LP (Liquidity Provider):</strong> Add tokens to trading pools, earn fees</li>
                            <li><strong>Staking:</strong> Lock tokens to earn protocol rewards</li>
                            <li><strong>Lending:</strong> Deposit tokens for interest</li>
                        </ul>
                        <p>Risks to understand:</p>
                        <ul>
                            <li>Impermanent Loss (for LPs)</li>
                            <li>Smart contract bugs</li>
                            <li>Token price depreciation</li>
                            <li>Protocol insolvency</li>
                        </ul>
                    `
                },
                {
                    title: 'Impermanent Loss Explained',
                    content: `
                        <h3>Understanding Impermanent Loss</h3>
                        <p>When you provide liquidity, price changes can cause "impermanent loss".</p>
                        <p>Example:</p>
                        <ul>
                            <li>You deposit $500 ETH + $500 USDC into a pool</li>
                            <li>ETH doubles in price</li>
                            <li>Pool rebalances: you now have less ETH, more USDC</li>
                            <li>If you had just held, you'd have more value</li>
                        </ul>
                        <p>When IL is acceptable:</p>
                        <ul>
                            <li>Trading fees exceed the loss</li>
                            <li>You believe prices will converge back</li>
                            <li>You're farming high-APY rewards</li>
                        </ul>
                    `
                },
                {
                    title: 'Stablecoin Strategies',
                    content: `
                        <h3>Low-Risk Stablecoin Farming</h3>
                        <p>Stablecoin strategies minimize price volatility risk:</p>
                        <ul>
                            <li><strong>Stablecoin Lending:</strong> 3-8% APY, low risk</li>
                            <li><strong>Stablecoin LPs:</strong> USDC/USDT pools, minimal IL</li>
                            <li><strong>Delta-Neutral:</strong> Hedge exposure while farming</li>
                        </ul>
                        <p>Obelisk Investment Products:</p>
                        <ul>
                            <li>Safe Haven: 4-5% APY, 100% capital protected</li>
                            <li>Balanced: 7-10% APY, 90% protected</li>
                        </ul>
                    `
                },
                {
                    title: 'Arbitrage Opportunities',
                    content: `
                        <h3>Crypto Arbitrage</h3>
                        <p>Arbitrage = profiting from price differences across markets.</p>
                        <p>Types:</p>
                        <ul>
                            <li><strong>CEX-DEX:</strong> Buy on Binance, sell on Uniswap</li>
                            <li><strong>Cross-DEX:</strong> Price differences between DEXs</li>
                            <li><strong>Funding Rate:</strong> Earn funding on perpetuals</li>
                            <li><strong>Triangular:</strong> A -> B -> C -> A with profit</li>
                        </ul>
                        <p>Reality check:</p>
                        <ul>
                            <li>Bots dominate arbitrage</li>
                            <li>Profits are small (0.1-0.5%)</li>
                            <li>Requires speed and capital</li>
                        </ul>
                    `
                }
            ]
        },

        'risk-management': {
            title: 'Risk Management',
            lessons: [
                {
                    title: 'The 1% Rule',
                    content: `
                        <h3>Never Risk More Than 1-2%</h3>
                        <p>Professional traders limit risk per trade to 1-2% of their portfolio.</p>
                        <p>Example with $10,000 portfolio:</p>
                        <ul>
                            <li>Max risk per trade: $100-200</li>
                            <li>If stop-loss is 5%, position size = $2,000-4,000</li>
                            <li>10 losing trades = 10-20% drawdown (recoverable)</li>
                        </ul>
                        <p>Why this works:</p>
                        <ul>
                            <li>Survive losing streaks</li>
                            <li>Compound gains over time</li>
                            <li>Remove emotional decision-making</li>
                        </ul>
                    `
                },
                {
                    title: 'Position Sizing',
                    content: `
                        <h3>Calculating Position Size</h3>
                        <p>Position size formula:</p>
                        <code>Position = (Portfolio x Risk%) / Stop-Loss%</code>
                        <p>Example:</p>
                        <ul>
                            <li>Portfolio: $10,000</li>
                            <li>Risk per trade: 2% = $200</li>
                            <li>Stop-loss: 5% from entry</li>
                            <li>Position size: $200 / 0.05 = $4,000</li>
                        </ul>
                        <p>With leverage, your margin would be: $4,000 / Leverage</p>
                    `
                },
                {
                    title: 'Diversification',
                    content: `
                        <h3>Don't Put All Eggs in One Basket</h3>
                        <p>Diversification reduces unsystematic risk:</p>
                        <ul>
                            <li><strong>Asset Classes:</strong> BTC, ETH, alts, stablecoins</li>
                            <li><strong>Strategies:</strong> Trading, farming, holding</li>
                            <li><strong>Timeframes:</strong> Short-term trades, long-term investments</li>
                            <li><strong>Platforms:</strong> Multiple exchanges/protocols</li>
                        </ul>
                        <p>Sample allocation:</p>
                        <ul>
                            <li>40% BTC/ETH (core holdings)</li>
                            <li>30% Altcoins (higher risk/reward)</li>
                            <li>20% Stablecoins (yield farming)</li>
                            <li>10% Trading capital</li>
                        </ul>
                    `
                },
                {
                    title: 'Drawdown Management',
                    content: `
                        <h3>Surviving Drawdowns</h3>
                        <p>Drawdown = peak-to-trough decline in your portfolio.</p>
                        <p>Recovery math:</p>
                        <ul>
                            <li>10% loss requires 11% gain to recover</li>
                            <li>25% loss requires 33% gain to recover</li>
                            <li>50% loss requires 100% gain to recover</li>
                        </ul>
                        <p>Rules:</p>
                        <ul>
                            <li>Stop trading after 3 consecutive losses</li>
                            <li>Reduce position size after 20% drawdown</li>
                            <li>Take a break after 30% drawdown</li>
                        </ul>
                    `
                },
                {
                    title: 'Hedging Strategies',
                    content: `
                        <h3>Protecting Your Portfolio</h3>
                        <p>Hedging reduces risk during uncertain times:</p>
                        <ul>
                            <li><strong>Short Hedge:</strong> Short futures against long spot</li>
                            <li><strong>Options:</strong> Buy puts for downside protection</li>
                            <li><strong>Stablecoin Conversion:</strong> Move to USDC during volatility</li>
                            <li><strong>Correlation:</strong> Hold negatively correlated assets</li>
                        </ul>
                        <p>When to hedge:</p>
                        <ul>
                            <li>Before major news events</li>
                            <li>When market uncertainty is high</li>
                            <li>To lock in profits on winning positions</li>
                        </ul>
                    `
                }
            ]
        }
    },
    fr: {
        'getting-started': {
            title: 'Pour Commencer',
            lessons: [
                { title: 'Bienvenue sur Obelisk DEX', content: `<h3>Bienvenue, Reclaimer</h3><p>Obelisk DEX est un <strong>exchange décentralisé</strong> (DEX) qui vous permet de trader des cryptomonnaies directement depuis votre wallet, sans intermédiaires.</p><p>Principes clés :</p><ul><li><strong>Non-Custodial :</strong> Vous contrôlez vos clés privées. Nous ne détenons jamais vos fonds.</li><li><strong>Sécurité Post-Quantique :</strong> Protégé contre les futures attaques par ordinateurs quantiques.</li><li><strong>Transparent :</strong> Tous les trades sont on-chain avec visibilité totale.</li></ul>` },
                { title: 'Connecter Votre Wallet', content: `<h3>Connectez Votre Wallet</h3><p>Pour utiliser Obelisk DEX, vous avez besoin d'un wallet Web3. Nous recommandons :</p><ul><li><strong>MetaMask :</strong> Extension navigateur la plus populaire</li><li><strong>WalletConnect :</strong> Connectez n'importe quel wallet mobile</li><li><strong>Rabby :</strong> Wallet orienté multi-chain</li></ul><p>Étapes de connexion :</p><ol><li>Cliquez sur "Connecter Wallet" en haut à droite</li><li>Sélectionnez votre fournisseur de wallet</li><li>Approuvez la connexion dans votre wallet</li><li>Vous êtes prêt à trader !</li></ol><p><strong>Conseil sécurité :</strong> Ne partagez JAMAIS votre phrase secrète. Obelisk ne vous la demandera JAMAIS.</p>` },
                { title: 'Aperçu de l\'Interface', content: `<h3>Naviguer dans l'Interface</h3><p>L'interface Obelisk est divisée en plusieurs sections :</p><ul><li><strong>Trade :</strong> Exécutez des ordres market et limit avec effet de levier</li><li><strong>Swap :</strong> Échanges simples sans levier</li><li><strong>Banking :</strong> Déposez, gagnez des intérêts, empruntez</li><li><strong>Wallet :</strong> Consultez vos soldes et historique</li><li><strong>Portfolio :</strong> Suivez vos positions et P&L</li></ul>` },
                { title: 'Comprendre les Frais de Gas', content: `<h3>Les Frais de Gas Expliqués</h3><p>Chaque transaction sur Ethereum/Arbitrum nécessite du <strong>gas</strong> - des frais payés aux validateurs du réseau.</p><p>Concepts clés :</p><ul><li><strong>Prix du Gas :</strong> Coût par unité de calcul (en Gwei)</li><li><strong>Limite de Gas :</strong> Maximum d'unités pour une transaction</li><li><strong>Coût Total :</strong> Prix du Gas x Gas Utilisé</li></ul><p>Obelisk fonctionne sur <strong>Arbitrum</strong>, un réseau Layer 2 avec des frais réduits (0.01-0.10$ par transaction).</p>` },
                { title: 'Mode Démo', content: `<h3>Pratiquez en Mode Démo</h3><p>Avant de risquer des fonds réels, pratiquez avec notre Mode Démo :</p><ul><li>Obtenez 10 000$ en fonds virtuels</li><li>Exécutez des trades sans risque réel</li><li>Apprenez l'interface et les stratégies</li><li>Suivez vos performances</li></ul><p>Pour activer le Mode Démo, allez dans Paramètres et activez "Mode Démo".</p><p><strong>Important :</strong> Les trades démo sont simulés. Le trading réel implique des risques financiers réels.</p>` }
            ]
        },
        'trading-fundamentals': {
            title: 'Fondamentaux du Trading',
            lessons: [
                { title: 'Ordres Market', content: `<h3>Ordres Market</h3><p>Un ordre market s'exécute <strong>immédiatement</strong> au prix actuel du marché.</p><p>Quand l'utiliser :</p><ul><li>Vous devez entrer ou sortir rapidement</li><li>L'actif a une forte liquidité</li><li>Le prix exact est moins important que la vitesse</li></ul><p>Inconvénients :</p><ul><li><strong>Slippage :</strong> Le prix exécuté peut différer</li><li>En marchés volatils, le slippage peut être significatif</li></ul>` },
                { title: 'Ordres Limit', content: `<h3>Ordres Limit</h3><p>Un ordre limit ne s'exécute qu'au <strong>prix spécifié ou mieux</strong>.</p><p>Quand l'utiliser :</p><ul><li>Acheter sous le prix actuel (acheter le creux)</li><li>Vendre au-dessus du prix actuel</li><li>Priorité au prix plutôt qu'à la vitesse</li></ul><p>Points clés :</p><ul><li>L'ordre peut ne jamais être exécuté</li><li>Bon pour les stratégies "placer et oublier"</li><li>Pas de risque de slippage</li></ul>` },
                { title: 'Positions Long vs Short', content: `<h3>Long vs Short</h3><p><strong>Position Long :</strong> Vous profitez quand le prix MONTE</p><ul><li>Acheter bas, vendre haut</li><li>Mentalité d'investissement traditionnelle</li><li>Perte maximum = votre investissement</li></ul><p><strong>Position Short :</strong> Vous profitez quand le prix BAISSE</p><ul><li>Vendre haut, racheter bas</li><li>Nécessite d'emprunter l'actif</li><li>Perte théoriquement illimitée</li></ul>` },
                { title: 'Lire le Carnet d\'Ordres', content: `<h3>Comprendre le Carnet d'Ordres</h3><p>Le carnet montre tous les ordres d'achat et vente en attente :</p><ul><li><strong>Bids (Vert) :</strong> Ordres d'achat</li><li><strong>Asks (Rouge) :</strong> Ordres de vente</li><li><strong>Spread :</strong> Écart entre le meilleur bid et ask</li></ul><p>Signaux à lire :</p><ul><li>Gros murs de bids = niveau de support potentiel</li><li>Gros murs d'asks = niveau de résistance potentiel</li></ul>` },
                { title: 'Ordres Stop-Loss', content: `<h3>Se Protéger avec le Stop-Loss</h3><p>Un stop-loss ferme automatiquement votre position à un niveau de perte spécifié.</p><p>Pourquoi utiliser des stop-loss :</p><ul><li>Limiter votre perte maximum par trade</li><li>Retirer l'émotion des décisions</li><li>Protection contre les crashes soudains</li></ul><p><strong>Règle d'or :</strong> Ne risquez jamais plus de 2% de votre portfolio sur un seul trade.</p>` },
                { title: 'Ordres Take-Profit', content: `<h3>Verrouiller les Profits</h3><p>Un take-profit ferme automatiquement votre position quand elle atteint un objectif de profit.</p><p>Avantages :</p><ul><li>Verrouiller les gains avant un retournement</li><li>Pas besoin de surveiller 24/7</li><li>Empêche la cupidité d'effacer les profits</li></ul><p>Conseils :</p><ul><li>Placer aux niveaux de résistance/support clés</li><li>Ratio risque/récompense minimum 1:2</li></ul>` },
                { title: 'Psychologie du Trading', content: `<h3>Maîtriser Votre Mental</h3><p>Votre plus grand ennemi en trading, c'est vous-même. Pièges courants :</p><ul><li><strong>FOMO :</strong> Chasser les pumps, acheter au sommet</li><li><strong>Revenge Trading :</strong> Essayer de récupérer les pertes immédiatement</li><li><strong>Surconfiance :</strong> Trop risquer après des gains</li><li><strong>Panic Selling :</strong> Sortir au pire moment</li></ul><p>Règles à suivre :</p><ol><li>Avoir un plan AVANT chaque trade</li><li>Accepter que les pertes font partie du trading</li><li>Ne jamais trader avec de l'argent qu'on ne peut pas perdre</li></ol>` }
            ]
        },
        'leverage-trading': {
            title: 'Comprendre le Levier',
            lessons: [
                { title: 'Qu\'est-ce que le Levier ?', content: `<h3>Le Levier Expliqué</h3><p>Le levier vous permet de contrôler une position plus grande avec moins de capital.</p><p>Exemple avec levier 10x :</p><ul><li>Vous avez 100$</li><li>Avec 10x, vous contrôlez 1 000$</li><li>Si le prix monte de +10%, vous gagnez +100$ (100% sur vos 100$)</li><li>Si le prix baisse de -10%, vous perdez -100$ (liquidation)</li></ul><p>Le levier est une <strong>épée à double tranchant</strong>. Il amplifie les gains ET les pertes.</p>` },
                { title: 'Marge et Collatéral', content: `<h3>Comprendre la Marge</h3><p><strong>Marge</strong> = le collatéral que vous déposez pour ouvrir une position à levier.</p><p>Termes clés :</p><ul><li><strong>Marge Initiale :</strong> Minimum requis pour ouvrir</li><li><strong>Marge de Maintenance :</strong> Minimum pour garder la position</li><li><strong>Ratio de Marge :</strong> Votre marge / Valeur de position</li></ul>` },
                { title: 'Mécanique de Liquidation', content: `<h3>Comment Fonctionne la Liquidation</h3><p>Quand vos pertes approchent votre marge, l'exchange <strong>liquide</strong> votre position pour éviter un solde négatif.</p><p>Formule (simplifiée) :</p><code>Prix de Liquidation = Prix d'Entrée x (1 - 1/Levier)</code><p>Exemple 10x Long à 100$ :</p><ul><li>Liquidation = 100$ x (1 - 0.1) = 90$</li><li>Si le prix tombe à 90$, vous perdez toute votre marge</li></ul>` },
                { title: 'Marge Isolée vs Cross', content: `<h3>Modes de Marge</h3><p><strong>Marge Isolée :</strong></p><ul><li>Risque limité à la marge assignée</li><li>Si liquidé, seule cette position est perdue</li><li>Bon pour trades risqués avec downside limité</li></ul><p><strong>Marge Cross :</strong></p><ul><li>Tout le solde utilisé comme marge</li><li>Les positions partagent la marge</li><li>Seuil de liquidation plus haut, mais risque tout le compte</li></ul><p><strong>Recommandation :</strong> Utilisez Isolée quand vous apprenez.</p>` },
                { title: 'Taux de Funding', content: `<h3>Taux de Funding Perpetuels</h3><p>Les futures perpétuels utilisent les <strong>taux de funding</strong> pour aligner le prix avec le spot.</p><p>Comment ça marche :</p><ul><li>Le funding est échangé entre longs et shorts</li><li>Taux positif : Les longs paient les shorts</li><li>Taux négatif : Les shorts paient les longs</li><li>Généralement payé toutes les 8 heures</li></ul>` },
                { title: 'Niveaux de Levier Recommandés', content: `<h3>Quel Levier Utiliser ?</h3><p>Règles d'or :</p><ul><li><strong>Débutants :</strong> 2x-3x maximum</li><li><strong>Intermédiaires :</strong> 5x-10x avec gestion de risque stricte</li><li><strong>Avancés :</strong> 10x-20x seulement pour scalping</li><li><strong>Jamais :</strong> 50x-100x c'est du gambling, pas du trading</li></ul>` },
                { title: 'Calculateur de Levier', content: `<h3>Calculer le Risque</h3><p>Avant tout trade à levier, calculez :</p><ol><li><strong>Taille de Position :</strong> Marge x Levier</li><li><strong>Prix de Liquidation :</strong> Entrée x (1 - 1/Levier) pour les longs</li><li><strong>Perte Max :</strong> Toute votre marge</li><li><strong>Mouvement requis pour 2x :</strong> (100/Levier)%</li></ol>` },
                { title: 'Erreurs Courantes à Éviter', content: `<h3>Pièges du Levier</h3><p>Évitez ces erreurs courantes :</p><ul><li><strong>Surlevier :</strong> Utiliser le max "pour plus de gains"</li><li><strong>Pas de Stop-Loss :</strong> "Ça va remonter" - derniers mots célèbres</li><li><strong>Ignorer le Funding :</strong> Positions mangées par le funding</li><li><strong>Ajouter aux Perdantes :</strong> "Moyenner à la baisse" sur des positions à levier</li></ul><p><strong>Rappel :</strong> L'objectif est de survivre pour trader un autre jour.</p>` }
            ]
        },
        'post-quantum': {
            title: 'Sécurité Post-Quantique',
            lessons: [
                { title: 'La Menace Quantique', content: `<h3>Pourquoi les Ordinateurs Quantiques Comptent</h3><p>La cryptographie actuelle (RSA, ECDSA) peut être cassée par les ordinateurs quantiques avec l'algorithme de Shor.</p><p>Chronologie :</p><ul><li><strong>Maintenant :</strong> Les ordinateurs quantiques sont faibles (centaines de qubits)</li><li><strong>2030-2035 :</strong> Experts prédisent des ordinateurs quantiques "cryptographiquement pertinents"</li><li><strong>Récolter Maintenant, Décrypter Plus Tard :</strong> Les attaquants peuvent stocker des données chiffrées aujourd'hui pour les décrypter plus tard</li></ul>` },
                { title: 'Standards Post-Quantiques NIST', content: `<h3>Le Nouveau Standard</h3><p>En 2024, le NIST a standardisé des algorithmes résistants au quantique :</p><ul><li><strong>FIPS 203 (ML-KEM) :</strong> Encapsulation de clés basée sur CRYSTALS-Kyber</li><li><strong>FIPS 204 (ML-DSA) :</strong> Signatures numériques basées sur CRYSTALS-Dilithium</li><li><strong>FIPS 205 (SLH-DSA) :</strong> Signatures basées sur hachage SPHINCS+</li></ul><p>Ces algorithmes sont conçus pour être sécurisés contre les ordinateurs classiques ET quantiques.</p>` },
                { title: 'CRYSTALS-Kyber', content: `<h3>CRYSTALS-Kyber Expliqué</h3><p>Kyber est utilisé pour l'<strong>encapsulation de clés</strong> - échanger des clés de chiffrement de manière sécurisée.</p><p>Comment ça marche :</p><ul><li>Basé sur le problème "Learning With Errors" (LWE)</li><li>Utilise la cryptographie sur réseaux (lattices)</li><li>Trouver la clé secrète revient à chercher une aiguille dans une botte de foin multidimensionnelle</li></ul><p>Obelisk utilise Kyber-1024 pour une sécurité maximale.</p>` },
                { title: 'CRYSTALS-Dilithium', content: `<h3>CRYSTALS-Dilithium Expliqué</h3><p>Dilithium est utilisé pour les <strong>signatures numériques</strong> - prouver que vous avez autorisé une transaction.</p><p>Comment ça marche :</p><ul><li>Également basé sur les problèmes de réseaux</li><li>Remplace ECDSA (utilisé dans Bitcoin/Ethereum)</li><li>Signature et vérification sont rapides</li></ul><p>Pourquoi c'est important pour la crypto :</p><ul><li>Chaque transaction nécessite une signature</li><li>Si les signatures peuvent être forgées, les coins peuvent être volés</li></ul>` },
                { title: 'SPHINCS+', content: `<h3>SPHINCS+ Sécurité de Secours</h3><p>SPHINCS+ est un schéma de <strong>signature basé sur le hachage</strong> - l'ultime solution de secours.</p><p>Avantages :</p><ul><li>Basé uniquement sur les fonctions de hachage (très bien comprises)</li><li>Aucune dépendance aux hypothèses sur les réseaux</li><li>Si la crypto sur réseaux est cassée, SPHINCS+ reste sécurisé</li></ul>` },
                { title: 'Comment Obelisk Implémente PQC', content: `<h3>Architecture de Sécurité Obelisk</h3><p>Obelisk implémente une approche en couches :</p><ol><li><strong>Échange de Clés :</strong> CRYSTALS-Kyber pour toutes les communications</li><li><strong>Signature de Transaction :</strong> CRYSTALS-Dilithium pour tous les trades</li><li><strong>Signatures de Secours :</strong> SPHINCS+ pour les opérations critiques</li><li><strong>Mode Hybride :</strong> Classique + PQC pour la période de transition</li></ol>` },
                { title: 'Bonnes Pratiques Sécurité Wallet', content: `<h3>Protéger Vos Clés</h3><p>Même avec PQC, votre sécurité dépend de vous :</p><ul><li><strong>Hardware Wallet :</strong> Utilisez un Ledger/Trezor pour des fonds importants</li><li><strong>Phrase Secrète :</strong> Écrivez sur papier/métal, stockez en coffre, JAMAIS numérique</li><li><strong>Wallets Multiples :</strong> Séparez hot wallet (trading) du cold storage</li></ul><p>Drapeaux rouges :</p><ul><li>Quiconque demande votre phrase secrète</li><li>Popups "sync wallet" ou "validation"</li><li>DMs non sollicités offrant de l'aide</li></ul>` },
                { title: 'L\'Avenir de la Sécurité Crypto', content: `<h3>Ce Qui Vient Ensuite</h3><p>L'industrie crypto transite vers PQC :</p><ul><li><strong>Ethereum :</strong> Recherche sur l'intégration PQC</li><li><strong>Bitcoin :</strong> Discussions sur soft fork pour PQC</li><li><strong>Obelisk :</strong> Déjà sécurisé quantique</li></ul><p>Prédictions :</p><ul><li>2025-2027 : Annonces de roadmaps PQC</li><li>2028-2030 : Migration vers hybride</li><li>2030+ : Adoption PQC complète</li></ul>` },
                { title: 'Quiz : Testez Vos Connaissances', content: `<h3>Quiz Sécurité Post-Quantique</h3><ol><li>Quel algorithme le calcul quantique utilise-t-il pour casser RSA ?<br><em>Réponse : Algorithme de Shor</em></li><li>Quel type de math CRYSTALS-Kyber utilise-t-il ?<br><em>Réponse : Cryptographie sur réseaux (LWE)</em></li><li>À quoi sert CRYSTALS-Dilithium ?<br><em>Réponse : Signatures numériques</em></li><li>Pourquoi SPHINCS+ est-il appelé "secours" ?<br><em>Réponse : Basé sur des maths différentes (hachages)</em></li></ol>` }
            ]
        },
        'defi-strategies': {
            title: 'Stratégies DeFi',
            lessons: [
                { title: 'Qu\'est-ce que la DeFi ?', content: `<h3>La Finance Décentralisée Expliquée</h3><p>La DeFi remplace les services financiers traditionnels par des smart contracts :</p><ul><li><strong>Prêt :</strong> Gagnez des intérêts en prêtant de la crypto</li><li><strong>Emprunt :</strong> Empruntez contre un collatéral</li><li><strong>Trading :</strong> Échangez des tokens directement (DEXs)</li><li><strong>Yield Farming :</strong> Gagnez des récompenses en fournissant de la liquidité</li></ul><p>Avantages :</p><ul><li>Disponible 24/7</li><li>Pas de vérification de crédit ni KYC</li><li>Accès sans permission</li><li>Transparent et auditable</li></ul>` },
                { title: 'Bases du Yield Farming', content: `<h3>Comment Fonctionne le Yield Farming</h3><p>Yield farming = gagner des récompenses en fournissant de la liquidité aux protocoles.</p><p>Stratégies courantes :</p><ul><li><strong>LP (Liquidity Provider) :</strong> Ajoutez des tokens aux pools de trading, gagnez des frais</li><li><strong>Staking :</strong> Bloquez des tokens pour des récompenses de protocole</li><li><strong>Lending :</strong> Déposez des tokens pour des intérêts</li></ul><p>Risques à comprendre :</p><ul><li>Perte Impermanente (pour les LPs)</li><li>Bugs de smart contracts</li><li>Dépréciation du prix du token</li></ul>` },
                { title: 'Perte Impermanente Expliquée', content: `<h3>Comprendre la Perte Impermanente</h3><p>Quand vous fournissez de la liquidité, les changements de prix peuvent causer une "perte impermanente".</p><p>Exemple :</p><ul><li>Vous déposez 500$ ETH + 500$ USDC dans un pool</li><li>ETH double de prix</li><li>Le pool se rééquilibre : vous avez moins d'ETH, plus d'USDC</li><li>Si vous aviez juste gardé, vous auriez plus de valeur</li></ul><p>Quand l'IL est acceptable :</p><ul><li>Les frais de trading dépassent la perte</li><li>Vous croyez que les prix vont converger</li><li>Vous farmez des rewards à haut APY</li></ul>` },
                { title: 'Stratégies Stablecoins', content: `<h3>Farming Stablecoin Bas Risque</h3><p>Les stratégies stablecoin minimisent le risque de volatilité :</p><ul><li><strong>Lending Stablecoin :</strong> 3-8% APY, risque bas</li><li><strong>LPs Stablecoin :</strong> Pools USDC/USDT, IL minimal</li><li><strong>Delta-Neutral :</strong> Couvrez l'exposition tout en farmant</li></ul>` },
                { title: 'Opportunités d\'Arbitrage', content: `<h3>Arbitrage Crypto</h3><p>Arbitrage = profiter des différences de prix entre marchés.</p><p>Types :</p><ul><li><strong>CEX-DEX :</strong> Acheter sur Binance, vendre sur Uniswap</li><li><strong>Cross-DEX :</strong> Différences de prix entre DEXs</li><li><strong>Funding Rate :</strong> Gagner le funding sur les perpétuels</li><li><strong>Triangulaire :</strong> A -> B -> C -> A avec profit</li></ul><p>Réalité :</p><ul><li>Les bots dominent l'arbitrage</li><li>Profits petits (0.1-0.5%)</li><li>Nécessite vitesse et capital</li></ul>` }
            ]
        },
        'risk-management': {
            title: 'Gestion du Risque',
            lessons: [
                { title: 'La Règle des 1%', content: `<h3>Ne Risquez Jamais Plus de 1-2%</h3><p>Les traders professionnels limitent le risque par trade à 1-2% de leur portfolio.</p><p>Exemple avec portfolio de 10 000$ :</p><ul><li>Risque max par trade : 100-200$</li><li>Si stop-loss à 5%, taille de position = 2 000-4 000$</li><li>10 trades perdants = 10-20% drawdown (récupérable)</li></ul><p>Pourquoi ça marche :</p><ul><li>Survivre aux séries perdantes</li><li>Composer les gains dans le temps</li><li>Retirer les décisions émotionnelles</li></ul>` },
                { title: 'Dimensionnement de Position', content: `<h3>Calculer la Taille de Position</h3><p>Formule de taille de position :</p><code>Position = (Portfolio x Risque%) / Stop-Loss%</code><p>Exemple :</p><ul><li>Portfolio : 10 000$</li><li>Risque par trade : 2% = 200$</li><li>Stop-loss : 5% de l'entrée</li><li>Taille de position : 200$ / 0.05 = 4 000$</li></ul><p>Avec levier, votre marge serait : 4 000$ / Levier</p>` },
                { title: 'Diversification', content: `<h3>Ne Pas Mettre Tous Ses Œufs dans le Même Panier</h3><p>La diversification réduit le risque non-systémique :</p><ul><li><strong>Classes d'Actifs :</strong> BTC, ETH, alts, stablecoins</li><li><strong>Stratégies :</strong> Trading, farming, holding</li><li><strong>Horizons :</strong> Trades court-terme, investissements long-terme</li><li><strong>Plateformes :</strong> Plusieurs exchanges/protocoles</li></ul><p>Allocation exemple :</p><ul><li>40% BTC/ETH (core)</li><li>30% Altcoins (risque/reward plus élevé)</li><li>20% Stablecoins (yield farming)</li><li>10% Capital de trading</li></ul>` },
                { title: 'Gestion du Drawdown', content: `<h3>Survivre aux Drawdowns</h3><p>Drawdown = baisse pic-creux de votre portfolio.</p><p>Maths de récupération :</p><ul><li>Perte de 10% nécessite 11% de gain pour récupérer</li><li>Perte de 25% nécessite 33% de gain</li><li>Perte de 50% nécessite 100% de gain</li></ul><p>Règles :</p><ul><li>Arrêter de trader après 3 pertes consécutives</li><li>Réduire la taille après 20% de drawdown</li><li>Prendre une pause après 30% de drawdown</li></ul>` },
                { title: 'Stratégies de Couverture', content: `<h3>Protéger Votre Portfolio</h3><p>La couverture (hedging) réduit le risque en période d'incertitude :</p><ul><li><strong>Short Hedge :</strong> Shorter des futures contre du spot long</li><li><strong>Options :</strong> Acheter des puts pour protection à la baisse</li><li><strong>Conversion Stablecoin :</strong> Passer en USDC pendant la volatilité</li><li><strong>Corrélation :</strong> Détenir des actifs négativement corrélés</li></ul><p>Quand couvrir :</p><ul><li>Avant des événements majeurs</li><li>Quand l'incertitude du marché est haute</li><li>Pour verrouiller les profits sur des positions gagnantes</li></ul>` }
            ]
        }
    }
    },

    // Get courses for current language
    get courses() {
        const lang = this.getLang();
        return this.coursesData[lang] || this.coursesData.en;
    },

    // State
    currentCourse: null,
    currentLesson: 0,
    progress: {},

    // Initialize
    init() {
        this.loadProgress();
        this.bindEvents();
        this.updateUI();
        console.log('[LEARN] Obelisk Academy initialized');
    },

    // Load saved progress
    loadProgress() {
        try {
            const saved = localStorage.getItem('obelisk_learn_progress');
            if (saved) {
                this.progress = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('[LEARN] Could not load progress:', e);
        }
    },

    // Save progress
    saveProgress() {
        try {
            localStorage.setItem('obelisk_learn_progress', JSON.stringify(this.progress));
        } catch (e) {
            console.warn('[LEARN] Could not save progress:', e);
        }
    },

    // Bind events using event delegation for reliability
    bindEvents() {
        // Use event delegation on tab-learn container for category tabs and course buttons
        const learnContainer = document.getElementById('tab-learn');
        if (learnContainer) {
            learnContainer.addEventListener('click', (e) => {
                // Category tab click
                const catTab = e.target.closest('.category-tab');
                if (catTab) {
                    const category = catTab.dataset.category;
                    this.filterCourses(category);
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    catTab.classList.add('active');
                    return;
                }

                // Course card / Start Course button click
                const startBtn = e.target.closest('.btn-start-course');
                const learnCard = e.target.closest('.learn-card');
                if (startBtn || learnCard) {
                    const card = startBtn ? startBtn.closest('.learn-card') : learnCard;
                    if (card && card.dataset.course) {
                        this.openCourse(card.dataset.course);
                    }
                    return;
                }
            });
        } else {
            // Fallback: direct binding (original approach)
            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const category = tab.dataset.category;
                    this.filterCourses(category);
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                });
            });

            document.querySelectorAll('.btn-start-course').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const card = e.target.closest('.learn-card');
                    const courseId = card.dataset.course;
                    this.openCourse(courseId);
                });
            });
        }

        // Modal close
        document.getElementById('close-course-modal')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Modal navigation
        document.getElementById('btn-prev-lesson')?.addEventListener('click', () => {
            this.prevLesson();
        });

        document.getElementById('btn-next-lesson')?.addEventListener('click', () => {
            this.nextLesson();
        });

        // Glossary search
        document.getElementById('glossary-search')?.addEventListener('input', (e) => {
            this.filterGlossary(e.target.value);
        });

        // Close modal on backdrop click
        document.getElementById('course-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'course-modal') {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('course-modal')?.classList.contains('active')) return;
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'ArrowRight') this.nextLesson();
            if (e.key === 'ArrowLeft') this.prevLesson();
        });
    },

    // Filter courses by category
    filterCourses(category) {
        document.querySelectorAll('.learn-card').forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    // Filter glossary
    filterGlossary(query) {
        const items = document.querySelectorAll('.glossary-item');
        const q = query.toLowerCase();

        items.forEach(item => {
            const term = item.querySelector('h4').textContent.toLowerCase();
            const def = item.querySelector('p').textContent.toLowerCase();
            if (term.includes(q) || def.includes(q)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    },

    // Open a course
    openCourse(courseId) {
        const course = this.courses[courseId];
        if (!course) return;

        this.currentCourse = courseId;
        this.currentLesson = this.progress[courseId]?.lastLesson || 0;

        const modal = document.getElementById('course-modal');
        modal.classList.add('active');

        this.showLesson();
    },

    // Close modal
    closeModal() {
        document.getElementById('course-modal').classList.remove('active');
        this.updateUI();
    },

    // Show current lesson
    showLesson() {
        const course = this.courses[this.currentCourse];
        const lesson = course.lessons[this.currentLesson];

        document.getElementById('modal-course-title').textContent = course.title;
        document.getElementById('modal-lesson-current').textContent = this.currentLesson + 1;
        document.getElementById('modal-lesson-total').textContent = course.lessons.length;
        document.getElementById('modal-course-content').innerHTML = lesson.content;

        // Update navigation buttons
        const prevBtn = document.getElementById('btn-prev-lesson');
        const nextBtn = document.getElementById('btn-next-lesson');

        prevBtn.style.display = this.currentLesson === 0 ? 'none' : 'block';

        if (this.currentLesson === course.lessons.length - 1) {
            nextBtn.textContent = 'Complete Course';
        } else {
            nextBtn.textContent = 'Next →';
        }

        // Save progress
        if (!this.progress[this.currentCourse]) {
            this.progress[this.currentCourse] = { lastLesson: 0, completed: false };
        }
        this.progress[this.currentCourse].lastLesson = this.currentLesson;
        this.saveProgress();
    },

    // Next lesson
    nextLesson() {
        const course = this.courses[this.currentCourse];

        if (this.currentLesson < course.lessons.length - 1) {
            this.currentLesson++;
            this.showLesson();
        } else {
            // Complete course
            this.completeCourse();
        }
    },

    // Previous lesson
    prevLesson() {
        if (this.currentLesson > 0) {
            this.currentLesson--;
            this.showLesson();
        }
    },

    // Complete a course
    completeCourse() {
        this.progress[this.currentCourse].completed = true;
        this.progress[this.currentCourse].lastLesson = 0;
        this.saveProgress();
        this.closeModal();
        this.showCompletionToast();
    },

    // Show completion toast
    showCompletionToast() {
        const toast = document.createElement('div');
        toast.className = 'learn-toast';
        toast.innerHTML = `<span>🎓</span> Course completed!`;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: linear-gradient(135deg, #c9a227, #d4af37);
            color: #000;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10003;
            opacity: 0;
            transition: all 0.3s;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Update UI with progress
    updateUI() {
        let completed = 0;
        const total = Object.keys(this.courses).length;

        Object.keys(this.courses).forEach(courseId => {
            const card = document.querySelector(`.learn-card[data-course="${courseId}"]`);
            if (!card) return;

            const courseProgress = this.progress[courseId];
            const progressBar = card.querySelector('.course-progress .progress-fill');
            const progressLabel = card.querySelector('.progress-label');
            const btn = card.querySelector('.btn-start-course');

            if (courseProgress?.completed) {
                progressBar.style.width = '100%';
                progressLabel.textContent = '100%';
                btn.textContent = 'Review';
                completed++;
            } else if (courseProgress?.lastLesson > 0) {
                const course = this.courses[courseId];
                const pct = Math.round((courseProgress.lastLesson / course.lessons.length) * 100);
                progressBar.style.width = `${pct}%`;
                progressLabel.textContent = `${pct}%`;
                btn.textContent = 'Continue';
            } else {
                progressBar.style.width = '0%';
                progressLabel.textContent = '0%';
                btn.textContent = 'Start Course';
            }
        });

        // Update hero progress
        const pct = Math.round((completed / total) * 100);
        document.getElementById('learn-progress-text').textContent = `${pct}%`;
        document.getElementById('courses-completed').textContent = completed;
        document.getElementById('courses-total').textContent = total;

        // Update progress ring
        const ring = document.getElementById('learn-progress-ring');
        if (ring) {
            const circumference = 283; // 2 * PI * 45
            const offset = circumference - (pct / 100 * circumference);
            ring.style.strokeDashoffset = offset;
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ObeliskAcademy.init());
} else {
    ObeliskAcademy.init();
}

window.ObeliskAcademy = ObeliskAcademy;
window.LearnModule = ObeliskAcademy; // Alias for compatibility
