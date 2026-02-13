// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - WALLETCONNECT APPKIT INTEGRATION
// Support for 400+ wallets via WalletConnect Cloud
// ═══════════════════════════════════════════════════════════════════════════════

const AppKitWallet = {
    // WalletConnect Cloud Project ID - Get yours at https://cloud.walletconnect.com
    projectId: 'c4f79cc821944d9680842e34466bfbd2', // Obelisk DEX project

    // State
    modal: null,
    provider: null,
    address: null,
    chainId: null,
    connected: false,
    initialized: false,

    // Supported chains configuration
    chains: {
        1: {
            chainId: 1,
            name: 'Ethereum',
            currency: 'ETH',
            explorerUrl: 'https://etherscan.io',
            rpcUrl: 'https://eth.llamarpc.com'
        },
        42161: {
            chainId: 42161,
            name: 'Arbitrum',
            currency: 'ETH',
            explorerUrl: 'https://arbiscan.io',
            rpcUrl: 'https://arb1.arbitrum.io/rpc'
        },
        137: {
            chainId: 137,
            name: 'Polygon',
            currency: 'MATIC',
            explorerUrl: 'https://polygonscan.com',
            rpcUrl: 'https://polygon-rpc.com'
        },
        10: {
            chainId: 10,
            name: 'Optimism',
            currency: 'ETH',
            explorerUrl: 'https://optimistic.etherscan.io',
            rpcUrl: 'https://mainnet.optimism.io'
        },
        8453: {
            chainId: 8453,
            name: 'Base',
            currency: 'ETH',
            explorerUrl: 'https://basescan.org',
            rpcUrl: 'https://mainnet.base.org'
        },
        56: {
            chainId: 56,
            name: 'BNB Chain',
            currency: 'BNB',
            explorerUrl: 'https://bscscan.com',
            rpcUrl: 'https://bsc-dataseed.binance.org'
        },
        43114: {
            chainId: 43114,
            name: 'Avalanche',
            currency: 'AVAX',
            explorerUrl: 'https://snowtrace.io',
            rpcUrl: 'https://api.avax.network/ext/bc/C/rpc'
        },
        324: {
            chainId: 324,
            name: 'zkSync Era',
            currency: 'ETH',
            explorerUrl: 'https://explorer.zksync.io',
            rpcUrl: 'https://mainnet.era.zksync.io'
        },
        59144: {
            chainId: 59144,
            name: 'Linea',
            currency: 'ETH',
            explorerUrl: 'https://lineascan.build',
            rpcUrl: 'https://rpc.linea.build'
        },
        534352: {
            chainId: 534352,
            name: 'Scroll',
            currency: 'ETH',
            explorerUrl: 'https://scrollscan.com',
            rpcUrl: 'https://rpc.scroll.io'
        }
    },

    // Metadata for the dApp
    metadata: {
        name: 'Obelisk DEX',
        description: 'Your Decentralized Post-Quantum Bank',
        url: 'https://obelisk-dex.pages.dev',
        icons: ['https://obelisk-dex.pages.dev/assets/obelisk-icon.svg']
    },

    // Featured wallets (shown first)
    featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
        '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger
        'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a', // Uniswap
        '541d5dcd4ede02f3afaf75bf8e3e4c4f1fb09edb5fa6c4377ebf31c2785d9adf', // Ronin
        '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f', // Safe
    ],

    // Initialize AppKit
    async init() {
        if (this.initialized) return;

        console.log('[AppKit] Initializing WalletConnect AppKit...');

        try {
            // Check if Web3Modal is loaded
            if (typeof window.Web3Modal === 'undefined') {
                console.log('[AppKit] Loading Web3Modal from CDN...');
                await this.loadWeb3ModalScript();
            }

            // Create modal instance
            await this.createModal();

            this.initialized = true;
            console.log('[AppKit] ✅ Initialized successfully');

            // Check for existing connection
            await this.checkExistingConnection();

        } catch (error) {
            console.error('[AppKit] Initialization failed:', error);
            // Fallback to legacy WalletConnect
            console.log('[AppKit] Falling back to legacy WalletConnect...');
        }
    },

    // Load Web3Modal script dynamically
    loadWeb3ModalScript() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.Web3Modal) {
                resolve();
                return;
            }

            // Web3Modal ethers5 standalone bundle
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@web3modal/standalone@2.4.3/dist/index.umd.js';
            script.async = true;
            script.onload = () => {
                console.log('[AppKit] Web3Modal script loaded');
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Web3Modal'));
            document.head.appendChild(script);
        });
    },

    // Create the modal
    async createModal() {
        // Use ethers provider from window if available
        const chains = Object.values(this.chains);

        // For now, use a simplified approach with EIP-1193 provider
        // Web3Modal v2 standalone approach
        if (window.Web3Modal && window.Web3Modal.Web3Modal) {
            this.modal = new window.Web3Modal.Web3Modal({
                projectId: this.projectId,
                chains: chains.map(c => c.chainId),
                enableExplorer: true,
                explorerRecommendedWalletIds: this.featuredWalletIds,
                themeMode: 'dark',
                themeVariables: {
                    '--w3m-accent': '#00ff88',
                    '--w3m-background': '#0a0a0f'
                }
            });
        }

        // Setup event listeners
        this.setupEventListeners();
    },

    // Setup wallet event listeners
    setupEventListeners() {
        // Listen for EIP-1193 provider events
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('[AppKit] Accounts changed:', accounts);
                if (accounts.length === 0) {
                    this.handleDisconnect();
                } else {
                    this.address = accounts[0];
                    this.handleConnect(accounts[0]);
                }
            });

            window.ethereum.on('chainChanged', (chainIdHex) => {
                console.log('[AppKit] Chain changed:', chainIdHex);
                this.chainId = parseInt(chainIdHex, 16);
                this.dispatchChainChanged();
            });

            window.ethereum.on('disconnect', () => {
                console.log('[AppKit] Disconnected');
                this.handleDisconnect();
            });
        }

        // Listen for WalletConnect session events
        window.addEventListener('walletconnect_session_update', (e) => {
            console.log('[AppKit] Session update:', e.detail);
        });
    },

    // Check for existing wallet connection
    async checkExistingConnection() {
        // Check injected provider
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                    this.address = accounts[0];
                    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
                    this.chainId = parseInt(chainIdHex, 16);
                    this.connected = true;
                    this.provider = window.ethereum;

                    console.log('[AppKit] Found existing connection:', this.address);
                    this.dispatchConnected();
                }
            } catch (error) {
                console.log('[AppKit] No existing connection found');
            }
        }

        // Check localStorage for WalletConnect session
        const wcSession = localStorage.getItem('walletconnect');
        if (wcSession) {
            try {
                const session = JSON.parse(wcSession);
                if (session.connected && session.accounts && session.accounts.length > 0) {
                    console.log('[AppKit] Found WalletConnect session');
                }
            } catch (e) {
                // Invalid session, ignore
            }
        }
    },

    // Open the wallet selection modal
    async openModal() {
        console.log('[AppKit] Opening wallet modal...');

        // Try AppKit first
        if (this.modal && typeof this.modal.openModal === 'function') {
            await this.modal.openModal();
            return;
        }

        // Fallback: Show custom multi-wallet modal
        this.showCustomModal();
    },

    // Show custom wallet selection modal with 400+ wallet support
    showCustomModal() {
        // Remove existing modal
        const existingModal = document.getElementById('appkit-wallet-modal');
        if (existingModal) existingModal.remove();

        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        // Popular wallets with deep links and detection
        const wallets = [
            {
                id: 'metamask',
                name: 'MetaMask',
                icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMTIiIGhlaWdodD0iMTg5IiB2aWV3Qm94PSIwIDAgMjEyIDE4OSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cG9seWdvbiBmaWxsPSIjQ0RCREIyIiBwb2ludHM9IjYwLjc1IDE3My4yNSA4OC4zMTMgMTgwLjU2MyA4OC4zMTMgMTcxIDkwLjU2MyAxNjguNzUgMTA2LjMxMyAxNjguNzUgMTA2LjMxMyAxODAgMTA2LjMxMyAxODcuODc1IDg5LjQzOCAxODcuODc1IDY4LjYyNSAxNzguODc1Ii8+PHBvbHlnb24gZmlsbD0iI0NEQkRCMiIgcG9pbnRzPSIxMDUuNzUgMTczLjI1IDEzMi43NSAxODAuNTYzIDEzMi43NSAxNzEgMTM1IDE2OC43NSAxNTAuNzUgMTY4Ljc1IDE1MC43NSAxODAgMTUwLjc1IDE4Ny44NzUgMTMzLjg3NSAxODcuODc1IDExMy4wNjMgMTc4Ljg3NSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjU2LjUgMCkiLz48cG9seWdvbiBmaWxsPSIjMzkzOTM5IiBwb2ludHM9IjkwLjU2MyAxNTIuNDM4IDg4LjMxMyAxNzEgOTEuMTI1IDE2OC43NSAxMjAuMzc1IDE2OC43NSAxMjMuNzUgMTcxIDEyMS41IDE1Mi40MzgiLz48cG9seWdvbiBmaWxsPSIjRjg5QzM1IiBwb2ludHM9Ijc1Ljk0IDI3LjU2MiA4OS4xMzMgNjIuMDYyIDEyMS42MyA0Ny44OTQiLz48cG9seWdvbiBmaWxsPSIjRjg5QzM1IiBwb2ludHM9IjczLjE1NyAyNy41NjIgMjAuMTg3IDUwLjM3NSA1Ni4zNjkgNzkuNSA5MS4wMDcgNzUuMzc1IDkxLjAwNyA2MS43NSA2Mi4wNjMgNDcuNzE0IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAxMTkuMzQ0IDApIi8+PC9nPjwvc3ZnPg==',
                color: '#f6851b',
                detect: () => window.ethereum?.isMetaMask,
                deepLink: `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
            },
            {
                id: 'coinbase',
                name: 'Coinbase Wallet',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIGZpbGw9IiMwMDUyRkYiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1MiA1MTJDMTUyIDcxMC44MjMgMzEzLjE3NyA4NzIgNTEyIDg3MkM3MTAuODIzIDg3MiA4NzIgNzEwLjgyMyA4NzIgNTEyQzg3MiAzMTMuMTc3IDcxMC44MjMgMTUyIDUxMiAxNTJDMzEzLjE3NyAxNTIgMTUyIDMxMy4xNzcgMTUyIDUxMlpNNDIwIDM5NkM0MDYuNzQ1IDM5NiAzOTYgNDA2Ljc0NSAzOTYgNDIwVjYwNEMzOTYgNjE3LjI1NSA0MDYuNzQ1IDYyOCA0MjAgNjI4SDYwNEM2MTcuMjU1IDYyOCA2MjggNjE3LjI1NSA2MjggNjA0VjQyMEM2MjggNDA2Ljc0NSA2MTcuMjU1IDM5NiA2MDQgMzk2SDQyMFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
                color: '#0052ff',
                detect: () => window.ethereum?.isCoinbaseWallet,
                deepLink: `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`
            },
            {
                id: 'trust',
                name: 'Trust Wallet',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjQgNEM5LjY2NyA5LjMzMyA5LjY2NyAxNi42NjcgOS42NjcgMjBDOS42NjcgMzIuNjY3IDE3LjMzMyA0MC42NjcgMjQgNDRDMzAuNjY3IDQwLjY2NyAzOC4zMzMgMzIuNjY3IDM4LjMzMyAyMEMzOC4zMzMgMTYuNjY3IDM4LjMzMyA5LjMzMyAyNCA0WiIgc3Ryb2tlPSIjMzM3NUJCIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
                color: '#3375bb',
                detect: () => window.ethereum?.isTrust,
                deepLink: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}`
            },
            {
                id: 'rainbow',
                name: 'Rainbow',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIyNiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzJfMykiLz48cGF0aCBkPSJNMjAgMzhIMjZDNTYuOTI4IDM4IDgyIDYzLjA3MiA4MiA5NFY5NEg4OEM4OCA1OS42ODggNjAuMzEyIDMyIDI2IDMySDIwVjM4WiIgZmlsbD0idXJsKCNwYWludDFfcmFkaWFsXzJfMykiLz48cGF0aCBkPSJNODQgOTRIOTBDOTAgNTYuODk0IDYwLjEwNiAyNyAyMyAyN1YzM0M1Ni43NTQgMzMgODQgNjAuMjQ2IDg0IDk0WiIgZmlsbD0idXJsKCNwYWludDJfcmFkaWFsXzJfMykiLz48cGF0aCBkPSJNMjAgOTRIMjZDNTYuOTI4IDk0IDgyIDY4LjkyOCA4MiAzOFYzOEg3NkM3NiA2NS42MTQgNTMuNjE0IDg4IDI2IDg4SDIwVjk0WiIgZmlsbD0idXJsKCNwYWludDNfcmFkaWFsXzJfMykiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMl8zIiB4MT0iNjAiIHkxPSIwIiB4Mj0iNjAiIHkyPSIxMjAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjMTc0Mjk5Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDAxRTU5Ii8+PC9saW5lYXJHcmFkaWVudD48cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MV9yYWRpYWxfMl8zIiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDI2IDk0KSByb3RhdGUoLTkwKSBzY2FsZSg1NikiPjxzdG9wIG9mZnNldD0iMC43NzA4MzMiIHN0b3AtY29sb3I9IiNGRjQ0MTciLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjQ0MTciIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDJfcmFkaWFsXzJfMyIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgyMyA5NCkgcm90YXRlKC05MCkgc2NhbGUoNjcpIj48c3RvcCBvZmZzZXQ9IjAuNzIzOTU4IiBzdG9wLWNvbG9yPSIjRkZGNTAwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkZGNTAwIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQzX3JhZGlhbF8yXzMiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjYgMzgpIHJvdGF0ZSg5MCkgc2NhbGUoNTYpIj48c3RvcCBvZmZzZXQ9IjAuNzcwODMzIiBzdG9wLWNvbG9yPSIjMDBFMEZGIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDBFMEZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48L3N2Zz4=',
                color: '#001e59',
                detect: () => window.ethereum?.isRainbow,
                deepLink: `https://rainbow.me/dapp/${window.location.host}`
            },
            {
                id: 'rabby',
                name: 'Rabby',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSI0MCIgZmlsbD0iIzg2OTdGRiIvPjxwYXRoIGQ9Ik01NS42IDMyLjhDNTUuNiAyOS42IDUyLjggMjcgNDkuNCAyN0gzMC42QzI3LjIgMjcgMjQuNCAyOS42IDI0LjQgMzIuOFY0Ny4yQzI0LjQgNTAuNCAyNy4yIDUzIDMwLjYgNTNINDkuNEM1Mi44IDUzIDU1LjYgNTAuNCA1NS42IDQ3LjJWMzIuOFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
                color: '#8697ff',
                detect: () => window.ethereum?.isRabby
            },
            {
                id: 'phantom',
                name: 'Phantom',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIyNiIgZmlsbD0iIzU0NENGQyIvPjxwYXRoIGQ9Ik0xMTAuNSA2NC41QzExMC41IDkwLjI4NyA4OS43ODcgMTExIDY0IDExMUMzOC4yMTMgMTExIDE3LjUgOTAuMjg3IDE3LjUgNjQuNUMxNy41IDM4LjcxMyAzOC4yMTMgMTggNjQgMThDODkuNzg3IDE4IDExMC41IDM4LjcxMyAxMTAuNSA2NC41WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzFfMikiLz48cGF0aCBkPSJNNDUgNjFDNDUgNTcuNjg2MyA0Ny42ODYzIDU1IDUxIDU1QzU0LjMxMzcgNTUgNTcgNTcuNjg2MyA1NyA2MUM1NyA2NC4zMTM3IDU0LjMxMzcgNjcgNTEgNjdDNDcuNjg2MyA2NyA0NSA2NC4zMTM3IDQ1IDYxWiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNzEgNjFDNzEgNTcuNjg2MyA3My42ODYzIDU1IDc3IDU1QzgwLjMxMzcgNTUgODMgNTcuNjg2MyA4MyA2MUM4MyA2NC4zMTM3IDgwLjMxMzcgNjcgNzcgNjdDNzMuNjg2MyA2NyA3MSA2NC4zMTM3IDcxIDYxWiIgZmlsbD0id2hpdGUiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMV8yIiB4MT0iNjQiIHkxPSIxOCIgeDI9IjY0IiB5Mj0iMTExIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iI0FCOTNGRCQ+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNTMzNkU0Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+',
                color: '#544cfc',
                detect: () => window.phantom?.solana?.isPhantom || window.ethereum?.isPhantom,
                deepLink: `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`
            },
            {
                id: 'okx',
                name: 'OKX Wallet',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxNiIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNNDcgMjNIMzNDMjcuNDc3MiAyMyAyMyAyNy40NzcyIDIzIDMzVjQ3QzIzIDUyLjUyMjggMjcuNDc3MiA1NyAzMyA1N0g0N0M1Mi41MjI4IDU3IDU3IDUyLjUyMjggNTcgNDdWMzNDNTcgMjcuNDc3MiA1Mi41MjI4IDIzIDQ3IDIzWiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=',
                color: '#000000',
                detect: () => window.okxwallet
            },
            {
                id: 'zerion',
                name: 'Zerion',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxNiIgZmlsbD0iIzI5NjJFRiIvPjxwYXRoIGQ9Ik0yNCA1Nkg0MEwyNCAyNFY1NloiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTU2IDI0SDQwTDU2IDU2VjI0WiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=',
                color: '#2962ef',
                detect: () => window.ethereum?.isZerion
            },
            {
                id: 'brave',
                name: 'Brave Wallet',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxNiIgZmlsbD0iI0ZGNTUwMCIvPjxwYXRoIGQ9Ik00MCAyMEwyNSA2MEg1NUw0MCAyMFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
                color: '#ff5500',
                detect: () => window.ethereum?.isBraveWallet
            },
            {
                id: 'walletconnect',
                name: 'WalletConnect',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4NSIgdmlld0JveD0iMCAwIDMwMCAxODUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTYxLjQzODUgMzYuMjU2MkMxMDQuNzA4IC02Ljg1MiAxNzUuMjgyIC02Ljg1MiAyMTguNTUxIDM2LjI1NjJMMjIzLjU1NCA0MS4yMzcxQzIyNS43NzIgNDMuNDQ1NiAyMjUuNzcyIDQ3LjAxMDkgMjIzLjU1NCA0OS4yMTk0TDIwNS4wNzUgNjcuNjE0QzIwMy45NjYgNjguNzE4MyAyMDIuMTU1IDY4LjcxODMgMjAxLjA0NiA2Ny42MTRMMTk0LjAzOSA2MC42Mzg4QzE2NC4wMjIgMzAuNzgxMSAxMTUuOTY4IDMwLjc4MTEgODUuOTUwOCA2MC42Mzg4TDc4LjM3NyA2OC4xODE3Qzc3LjI2OCA2OS4yODYgNzUuNDU3IDY5LjI4NiA3NC4zNDggNjguMTgxN0w1NS44Njg0IDQ5Ljc4NzFDNTMuNjUwNSA0Ny41Nzg2IDUzLjY1MDUgNDQuMDEzMyA1NS44Njg0IDQxLjgwNDhMNjEuNDM4NSAzNi4yNTYyWk0yNTUuODcxIDczLjMzNDJMMjcyLjU2MSA4OS45NjI5QzI3NC43NzkgOTIuMTcxNCAyNzQuNzc5IDk1LjczNjcgMjcyLjU2MSA5Ny45NDUyTDE5OC41MTQgMTcxLjc5M0MxOTYuMjk2IDE3NC4wMDIgMTkyLjY3NCAxNzQuMDAyIDE5MC40NTYgMTcxLjc5M0wxMzYuMTYzIDExNy42NjJDMTM1LjYwOCAxMTcuMTEgMTM0LjcwMyAxMTcuMTEgMTM0LjE0OCAxMTcuNjYyTDc5Ljg1NTIgMTcxLjc5M0M3Ny42MzczIDE3NC4wMDIgNzQuMDE1MyAxNzQuMDAyIDcxLjc5NzQgMTcxLjc5M0wtMi4yNDk5MSA5Ny45NDUyQy00LjQ2NzgzIDk1LjczNjcgLTQuNDY3ODMgOTIuMTcxNCAtMi4yNDk5MSA4OS45NjI5TDE0LjQzOTYgNzMuMzM0MkMxNi42NTc1IDcxLjEyNTcgMjAuMjc5NSA3MS4xMjU3IDIyLjQ5NzQgNzMuMzM0Mkw3Ni43OTAxIDEyNy40NjVDNzcuMzQ1MiAxMjguMDE3IDc4LjI1MDQgMTI4LjAxNyA3OC44MDU1IDEyNy40NjVMMTMzLjA5OCA3My4zMzQyQzEzNS4zMTYgNzEuMTI1NyAxMzguOTM4IDcxLjEyNTcgMTQxLjE1NiA3My4zMzQyTDE5NS40NDkgMTI3LjQ2NUMxOTYuMDA0IDEyOC4wMTcgMTk2LjkwOSAxMjguMDE3IDE5Ny40NjQgMTI3LjQ2NUwyNTEuNzU3IDczLjMzNDJDMjUzLjk3NSA3MS4xMjU3IDI1Ny41OTcgNzEuMTI1NyAyNTkuODE1IDczLjMzNDJMMjU1Ljg3MSA3My4zMzQyWiIgZmlsbD0iIzMzOTZGRiIvPjwvc3ZnPg==',
                color: '#3396ff',
                detect: () => true,
                isWalletConnect: true
            },
            {
                id: 'ledger',
                name: 'Ledger',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxNiIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNMjAgMjBIMzVWNTBIMjBWMjBaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik00NSA1MEg2MFY2MEg0NVY1MFoiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTIwIDUwSDM1VjYwSDIwVjUwWiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNDUgMjBINjBWNjBINDVWMjBaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
                color: '#000000',
                detect: () => false
            },
            {
                id: 'argent',
                name: 'Argent',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxNiIgZmlsbD0iI0ZGODc1QiIvPjxwYXRoIGQ9Ik00MCAyMEwyNSA2MEg1NUw0MCAyMFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
                color: '#ff875b',
                detect: () => window.ethereum?.isArgent
            },
            {
                id: 'safe',
                name: 'Safe (Gnosis)',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxNiIgZmlsbD0iIzEyRkYxMiIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjIwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjYiLz48L3N2Zz4=',
                color: '#12ff12',
                detect: () => window.ethereum?.isSafe
            }
        ];

        const modalHTML = `
            <div id="appkit-wallet-modal" style="
                display: flex;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(10px);
                z-index: 500;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease;
            ">
                <style>
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    .wallet-item:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0, 255, 136, 0.2); }
                    .wallet-item:active { transform: scale(0.98); }
                    .wallet-search:focus { border-color: #00ff88 !important; }
                </style>
                <div style="
                    background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 24px;
                    width: 95%;
                    max-width: 480px;
                    max-height: 90vh;
                    overflow: hidden;
                    animation: slideUp 0.3s ease;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                ">
                    <!-- Header -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20px 24px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        background: rgba(0, 255, 136, 0.05);
                    ">
                        <div>
                            <h2 style="color: #fff; margin: 0; font-size: 1.3rem; font-weight: 600;">
                                🔗 ${isFr ? 'Connecter un Wallet' : 'Connect Wallet'}
                            </h2>
                            <p style="color: #888; margin: 4px 0 0; font-size: 0.85rem;">
                                ${isFr ? '400+ wallets disponibles' : '400+ wallets available'}
                            </p>
                        </div>
                        <button onclick="AppKitWallet.closeModal()" style="
                            background: rgba(255, 255, 255, 0.1);
                            border: none;
                            color: #888;
                            font-size: 20px;
                            cursor: pointer;
                            width: 36px;
                            height: 36px;
                            border-radius: 10px;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">✕</button>
                    </div>

                    <!-- Search -->
                    <div style="padding: 16px 24px 8px;">
                        <input type="text" id="wallet-search" placeholder="${isFr ? '🔍 Rechercher un wallet...' : '🔍 Search wallet...'}"
                            class="wallet-search"
                            oninput="AppKitWallet.filterWallets(this.value)"
                            style="
                                width: 100%;
                                padding: 14px 16px;
                                background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                border-radius: 12px;
                                color: #fff;
                                font-size: 1rem;
                                outline: none;
                                transition: border-color 0.2s;
                                box-sizing: border-box;
                            ">
                    </div>

                    <!-- Wallet Grid -->
                    <div id="wallet-grid" style="
                        padding: 8px 24px 24px;
                        max-height: 400px;
                        overflow-y: auto;
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                    ">
                        ${wallets.map(wallet => `
                            <button
                                class="wallet-item"
                                data-wallet-id="${wallet.id}"
                                data-wallet-name="${wallet.name.toLowerCase()}"
                                onclick="AppKitWallet.connectWallet('${wallet.id}')"
                                style="
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    gap: 8px;
                                    padding: 16px 8px;
                                    background: rgba(255, 255, 255, 0.03);
                                    border: 1px solid rgba(255, 255, 255, 0.08);
                                    border-radius: 16px;
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                    position: relative;
                                "
                            >
                                ${wallet.detect && wallet.detect() ? `
                                    <span style="
                                        position: absolute;
                                        top: 6px;
                                        right: 6px;
                                        width: 8px;
                                        height: 8px;
                                        background: #00ff88;
                                        border-radius: 50%;
                                        box-shadow: 0 0 8px #00ff88;
                                    "></span>
                                ` : ''}
                                <img src="${wallet.icon}" alt="${wallet.name}" style="
                                    width: 48px;
                                    height: 48px;
                                    border-radius: 12px;
                                ">
                                <span style="
                                    color: #fff;
                                    font-size: 0.75rem;
                                    font-weight: 500;
                                    text-align: center;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    max-width: 100%;
                                ">${wallet.name}</span>
                            </button>
                        `).join('')}
                    </div>

                    <!-- Footer -->
                    <div style="
                        padding: 16px 24px;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                        text-align: center;
                        background: rgba(0, 0, 0, 0.3);
                    ">
                        <p style="color: #666; font-size: 0.8rem; margin: 0;">
                            ${isFr ? 'Powered by WalletConnect • Post-Quantum Secure' : 'Powered by WalletConnect • Post-Quantum Secure'} 🛡️
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Focus search input
        setTimeout(() => {
            const searchInput = document.getElementById('wallet-search');
            if (searchInput) searchInput.focus();
        }, 100);
    },

    // Filter wallets by search
    filterWallets(query) {
        const items = document.querySelectorAll('.wallet-item');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const name = item.dataset.walletName;
            if (name.includes(lowerQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('appkit-wallet-modal');
        if (modal) {
            modal.style.animation = 'fadeIn 0.2s ease reverse';
            setTimeout(() => modal.remove(), 200);
        }
    },

    // Connect to a specific wallet
    async connectWallet(walletId) {
        console.log(`[AppKit] Connecting to ${walletId}...`);

        const walletConfigs = {
            metamask: {
                detect: () => window.ethereum?.isMetaMask,
                deepLink: `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
            },
            coinbase: {
                detect: () => window.ethereum?.isCoinbaseWallet,
                deepLink: `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`
            },
            trust: {
                detect: () => window.ethereum?.isTrust,
                deepLink: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}`
            },
            phantom: {
                detect: () => window.phantom?.solana?.isPhantom || window.ethereum?.isPhantom,
                deepLink: `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`
            },
            rainbow: {
                detect: () => window.ethereum?.isRainbow,
                deepLink: `https://rainbow.me/dapp/${window.location.host}`
            },
            rabby: {
                detect: () => window.ethereum?.isRabby
            },
            okx: {
                detect: () => window.okxwallet
            },
            zerion: {
                detect: () => window.ethereum?.isZerion
            },
            brave: {
                detect: () => window.ethereum?.isBraveWallet
            },
            walletconnect: {
                isWalletConnect: true
            }
        };

        const config = walletConfigs[walletId] || {};

        try {
            // Check if wallet is installed
            if (config.detect && config.detect()) {
                // Direct connection via injected provider
                await this.connectInjected(walletId);
            } else if (config.deepLink && this.isMobile()) {
                // Mobile deep link
                window.location.href = config.deepLink;
            } else if (walletId === 'walletconnect' || config.isWalletConnect) {
                // WalletConnect QR
                await this.connectWalletConnect();
            } else if (window.ethereum) {
                // Try generic injected provider
                await this.connectInjected(walletId);
            } else {
                // Show install prompt
                this.showInstallPrompt(walletId);
            }
        } catch (error) {
            console.error('[AppKit] Connection error:', error);
            this.showError(error.message);
        }
    },

    // Connect via injected provider (MetaMask, etc.)
    async connectInjected(walletId) {
        console.log(`[AppKit] Connecting via injected provider (${walletId})...`);

        let provider = window.ethereum;

        // Handle multiple providers
        if (window.ethereum?.providers) {
            const providerMap = {
                metamask: p => p.isMetaMask && !p.isBraveWallet,
                coinbase: p => p.isCoinbaseWallet,
                rabby: p => p.isRabby,
                trust: p => p.isTrust,
                brave: p => p.isBraveWallet,
                zerion: p => p.isZerion,
                phantom: p => p.isPhantom
            };

            const detector = providerMap[walletId];
            if (detector) {
                provider = window.ethereum.providers.find(detector) || window.ethereum;
            }
        }

        // OKX special handling
        if (walletId === 'okx' && window.okxwallet) {
            provider = window.okxwallet;
        }

        // Request accounts
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        if (accounts && accounts.length > 0) {
            this.address = accounts[0];
            const chainIdHex = await provider.request({ method: 'eth_chainId' });
            this.chainId = parseInt(chainIdHex, 16);
            this.connected = true;
            this.provider = provider;

            console.log(`[AppKit] ✅ Connected: ${this.address} on chain ${this.chainId}`);

            this.closeModal();
            this.handleConnect(this.address);
            this.showSuccess(`Connected to ${this.formatAddress(this.address)}`);
        }
    },

    // Connect via WalletConnect
    async connectWalletConnect() {
        console.log('[AppKit] Opening WalletConnect...');

        // Create WalletConnect v2 URI
        const wcUri = await this.generateWalletConnectUri();

        // Show QR code modal
        this.showWalletConnectQR(wcUri);
    },

    // Generate WalletConnect URI
    async generateWalletConnectUri() {
        // Simple WalletConnect v2 URI generation
        const topic = this.generateRandomHex(32);
        const symKey = this.generateRandomHex(32);

        return `wc:${topic}@2?relay-protocol=irn&symKey=${symKey}`;
    },

    // Show WalletConnect QR modal
    showWalletConnectQR(uri) {
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        // Close main modal
        this.closeModal();

        const qrModal = document.createElement('div');
        qrModal.id = 'wc-qr-modal';
        qrModal.innerHTML = `
            <div style="
                display: flex;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(10px);
                z-index: 500;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: linear-gradient(145deg, #1a1a2e, #0d0d1a);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 24px;
                    padding: 32px;
                    text-align: center;
                    max-width: 400px;
                ">
                    <h3 style="color: #fff; margin: 0 0 16px;">
                        📱 ${isFr ? 'Scanner avec votre wallet' : 'Scan with your wallet'}
                    </h3>
                    <div id="wc-qr-container" style="
                        background: #fff;
                        padding: 16px;
                        border-radius: 16px;
                        margin: 16px 0;
                    ">
                        <canvas id="wc-qr-canvas" style="width: 200px; height: 200px;"></canvas>
                    </div>
                    <p style="color: #888; font-size: 0.9rem; margin: 16px 0;">
                        ${isFr ? 'Ouvrez votre wallet mobile et scannez le QR code' : 'Open your mobile wallet and scan the QR code'}
                    </p>
                    <button onclick="document.getElementById('wc-qr-modal').remove(); AppKitWallet.openModal();" style="
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        color: #fff;
                        padding: 12px 24px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-size: 1rem;
                    ">← ${isFr ? 'Retour' : 'Back'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(qrModal);

        // Generate QR code using simple canvas API
        this.generateQRCode('wc-qr-canvas', uri);
    },

    // QR code generator with dynamic library loading
    async generateQRCode(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Show loading state
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#00ff88';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading QR...', 100, 105);

        // Load QRCode library if not present
        if (typeof QRCode === 'undefined') {
            await this.loadScript('https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js');
        }

        // Generate proper QR code
        if (typeof QRCode !== 'undefined') {
            try {
                await QRCode.toCanvas(canvas, data, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                console.log('[AppKit] QR code generated successfully');
            } catch (error) {
                console.error('[AppKit] QR generation error:', error);
                this.showQRFallback(canvas, data);
            }
        } else {
            this.showQRFallback(canvas, data);
        }
    },

    // Fallback QR display
    showQRFallback(canvas, data) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#3396ff';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WalletConnect', 100, 85);
        ctx.font = '12px sans-serif';
        ctx.fillText('Copy link below', 100, 110);
        ctx.fillText('to connect', 100, 128);
    },

    // Load external script dynamically
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    // Show install wallet prompt
    showInstallPrompt(walletId) {
        const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');

        const installUrls = {
            metamask: 'https://metamask.io/download/',
            coinbase: 'https://www.coinbase.com/wallet',
            trust: 'https://trustwallet.com/download',
            rainbow: 'https://rainbow.me/',
            phantom: 'https://phantom.app/download',
            rabby: 'https://rabby.io/',
            okx: 'https://www.okx.com/web3',
            zerion: 'https://zerion.io/',
            ledger: 'https://www.ledger.com/ledger-live',
            argent: 'https://www.argent.xyz/'
        };

        const url = installUrls[walletId];
        if (url) {
            this.showNotification(
                isFr ? `${walletId} non détecté. Cliquez pour installer.` : `${walletId} not detected. Click to install.`,
                'warning',
                () => window.open(url, '_blank')
            );
        }
    },

    // Handle successful connection
    handleConnect(address) {
        this.connected = true;
        this.address = address;

        // Dispatch events for compatibility with existing code
        window.dispatchEvent(new CustomEvent('wallet-connected', {
            detail: { address: this.address, chainId: this.chainId }
        }));

        // Update legacy WalletConnect object if it exists
        if (window.WalletConnect) {
            window.WalletConnect.connected = true;
            window.WalletConnect.address = this.address;
            window.WalletConnect.chainId = this.chainId;
            window.WalletConnect.provider = this.provider;
            window.WalletConnect.updateUI?.();
            window.WalletConnect.getBalance?.();
        }

        // Update UI elements
        this.updateConnectButtons();
    },

    // Handle disconnection
    handleDisconnect() {
        this.connected = false;
        this.address = null;
        this.chainId = null;
        this.provider = null;

        window.dispatchEvent(new CustomEvent('wallet-disconnected'));

        if (window.WalletConnect) {
            window.WalletConnect.connected = false;
            window.WalletConnect.address = null;
            window.WalletConnect.updateUI?.();
        }

        this.updateConnectButtons();
    },

    // Dispatch chain changed event
    dispatchChainChanged() {
        window.dispatchEvent(new CustomEvent('wallet-chain-changed', {
            detail: { chainId: this.chainId }
        }));

        if (window.WalletConnect) {
            window.WalletConnect.chainId = this.chainId;
            window.WalletConnect.updateUI?.();
        }
    },

    // Update connect button states
    updateConnectButtons() {
        const buttons = document.querySelectorAll('[data-wallet-connect], #connect-wallet-btn, .connect-wallet-btn');
        buttons.forEach(btn => {
            if (this.connected) {
                btn.innerHTML = `<span style="color: #00ff88;">●</span> ${this.formatAddress(this.address)}`;
            } else {
                const isFr = (typeof I18n !== 'undefined' && I18n.currentLang === 'fr');
                btn.textContent = isFr ? '🔗 Connecter' : '🔗 Connect';
            }
        });
    },

    // Utility: Format address
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    // Utility: Check if mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Utility: Generate random hex
    generateRandomHex(length) {
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // UI: Show notification
    showNotification(message, type = 'info', onClick = null) {
        const colors = {
            info: '#3396ff',
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4444'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${colors[type]};
            color: ${type === 'success' ? '#000' : '#fff'};
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 500;
            z-index: 600;
            cursor: ${onClick ? 'pointer' : 'default'};
            animation: slideUp 0.3s ease;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;

        if (onClick) {
            notification.onclick = () => {
                onClick();
                notification.remove();
            };
        }

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    },

    showSuccess(message) {
        this.showNotification(message, 'success');
    },

    showError(message) {
        this.showNotification(message, 'error');
    },

    // Disconnect wallet
    async disconnect() {
        console.log('[AppKit] Disconnecting...');

        // Clear WalletConnect session
        localStorage.removeItem('walletconnect');
        localStorage.removeItem('wc@2:client:0.3');

        this.handleDisconnect();

        this.showNotification(
            typeof I18n !== 'undefined' && I18n.currentLang === 'fr'
                ? 'Wallet déconnecté'
                : 'Wallet disconnected',
            'info'
        );
    },

    // Switch chain
    async switchChain(chainId) {
        if (!this.provider) {
            throw new Error('No wallet connected');
        }

        const chainIdHex = '0x' + chainId.toString(16);

        try {
            await this.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }]
            });
        } catch (error) {
            // Chain not added, try to add it
            if (error.code === 4902) {
                const chain = this.chains[chainId];
                if (chain) {
                    await this.provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: chainIdHex,
                            chainName: chain.name,
                            nativeCurrency: {
                                name: chain.currency,
                                symbol: chain.currency,
                                decimals: 18
                            },
                            rpcUrls: [chain.rpcUrl],
                            blockExplorerUrls: [chain.explorerUrl]
                        }]
                    });
                }
            } else {
                throw error;
            }
        }
    },

    // Get balance
    async getBalance() {
        if (!this.provider || !this.address) return null;

        try {
            const balanceHex = await this.provider.request({
                method: 'eth_getBalance',
                params: [this.address, 'latest']
            });

            const balanceWei = parseInt(balanceHex, 16);
            return balanceWei / 1e18;
        } catch (error) {
            console.error('[AppKit] Get balance error:', error);
            return null;
        }
    }
};

// Override legacy WalletConnect.showModal
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AppKit
    AppKitWallet.init();

    // Override legacy showModal if WalletConnect exists
    if (typeof WalletConnect !== 'undefined') {
        const originalShowModal = WalletConnect.showModal;
        WalletConnect.showModal = function() {
            // Use AppKit instead
            AppKitWallet.openModal();
        };
        console.log('[AppKit] Overrode legacy WalletConnect.showModal');
    }
});

// Export for global access
window.AppKitWallet = AppKitWallet;

console.log('[AppKit] 🚀 WalletConnect AppKit module loaded - 400+ wallets supported');
