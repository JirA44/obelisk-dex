/**
 * OBELISK DEX - Obelisk Academy
 * Interactive Learning System
 */

const ObeliskAcademy = {
    // Course content
    courses: {
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

    // Bind events
    bindEvents() {
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                this.filterCourses(category);
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Course cards
        document.querySelectorAll('.btn-start-course').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.learn-card');
                const courseId = card.dataset.course;
                this.openCourse(courseId);
            });
        });

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
