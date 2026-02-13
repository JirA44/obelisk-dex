/**
 * OBELISK Live Mode Manager
 *
 * Gère le basculement DEMO/BETA/LIVE et les vraies transactions
 */

const ObeliskLive = {
  // Current mode and features
  mode: 'DEMO',
  features: null,
  kycStatus: null,

  // API base URL
  apiUrl: 'https://obelisk-dex.pages.dev/api', // Change in production

  /**
   * Initialize Live Mode
   */
  async init() {
    console.log('[ObeliskLive] Initializing...');

    // Detect API URL
    if (window.location.hostname === 'localhost') {
      this.apiUrl = 'http://localhost:3001/api';
    } else if (window.location.hostname.includes('pages.dev')) {
      this.apiUrl = 'http://localhost:3001/api'; // Backend runs locally for now
    }

    // Load features
    await this.loadFeatures();

    // Setup mode-specific UI
    this.setupUI();

    console.log(`[ObeliskLive] Mode: ${this.mode}`);
    return this;
  },

  /**
   * Load feature flags from API
   */
  async loadFeatures() {
    try {
      const response = await fetch(`${this.apiUrl}/features`);
      const data = await response.json();

      if (data.success) {
        this.features = data.features;
        this.mode = data.features.mode;
      }
    } catch (err) {
      console.warn('[ObeliskLive] Could not load features, using DEMO mode');
      this.mode = 'DEMO';
      this.features = {
        mode: 'DEMO',
        trading: { enabled: true, realExecution: false },
        deposits: { enabled: false },
        withdrawals: { enabled: false },
        defi: { aave: false, gmx: false },
        kyc: { required: false },
        demo: { showBanner: true }
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('obelisk_token');
  },

  /**
   * Get auth token
   */
  getToken() {
    return localStorage.getItem('obelisk_token');
  },

  /**
   * Setup UI based on mode
   */
  setupUI() {
    // Show/hide demo banner
    const demoBanner = document.getElementById('demo-banner');
    if (demoBanner) {
      demoBanner.style.display = this.features?.demo?.showBanner ? 'block' : 'none';
    }

    // Update deposit/withdraw buttons based on mode
    this.updateDepositButtons();
    this.updateInvestButtons();
  },

  /**
   * Update deposit button states
   */
  updateDepositButtons() {
    const depositBtn = document.getElementById('btn-deposit');
    if (!depositBtn) return;

    if (this.features?.deposits?.enabled) {
      // Enable real deposits
      depositBtn.disabled = false;
      depositBtn.textContent = 'Deposit USDC';
      depositBtn.onclick = () => this.showDepositModal();
    } else {
      // Demo mode - show message
      depositBtn.onclick = (e) => {
        e.preventDefault();
        this.showDemoMessage('deposits');
        return false;
      };
    }
  },

  /**
   * Update invest button states
   */
  updateInvestButtons() {
    document.querySelectorAll('[data-action="invest"]').forEach(btn => {
      if (this.features?.defi?.aave) {
        btn.onclick = () => this.showInvestModal(btn.dataset.protocol);
      } else {
        btn.onclick = (e) => {
          e.preventDefault();
          this.showDemoMessage('defi');
          return false;
        };
      }
    });
  },

  /**
   * Show demo mode message
   */
  showDemoMessage(feature) {
    const messages = {
      deposits: 'Les dépôts réels seront activés après la phase beta. Explorez avec les fonds de démonstration!',
      withdrawals: 'Les retraits réels seront activés après la phase beta.',
      defi: 'Les investissements DeFi réels seront activés après la phase beta. Utilisez le mode simulation pour tester.',
      kyc: 'La vérification d\'identité sera requise pour les transactions réelles.'
    };

    alert(`MODE DEMO\n\n${messages[feature] || 'Cette fonctionnalité n\'est pas encore activée.'}`);
  },

  /**
   * Check KYC status
   */
  async checkKYC() {
    if (!this.isAuthenticated()) {
      return { status: 'none', required: false };
    }

    try {
      const response = await fetch(`${this.apiUrl}/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      const data = await response.json();
      this.kycStatus = data.kyc;
      return this.kycStatus;
    } catch (err) {
      console.error('[ObeliskLive] KYC check failed:', err);
      return { status: 'none', required: false };
    }
  },

  /**
   * Start KYC verification
   */
  async startKYC() {
    if (!this.isAuthenticated()) {
      alert('Veuillez vous connecter pour vérifier votre identité.');
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/kyc/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/kyc/complete`
        })
      });

      const data = await response.json();

      if (data.alreadyVerified) {
        alert('Vous êtes déjà vérifié!');
        return;
      }

      if (data.verificationUrl) {
        // Redirect to Stripe Identity
        window.location.href = data.verificationUrl;
      } else {
        throw new Error('No verification URL received');
      }
    } catch (err) {
      console.error('[ObeliskLive] KYC start failed:', err);
      alert('Erreur lors du démarrage de la vérification. Réessayez plus tard.');
    }
  },

  /**
   * Show deposit modal (real deposits)
   */
  showDepositModal() {
    // Check KYC first if required
    if (this.features?.kyc?.required && this.kycStatus?.status !== 'verified') {
      this.showKYCRequiredModal();
      return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'obelisk-modal';
    modal.innerHTML = `
      <div class="obelisk-modal-content">
        <h2>Déposer USDC</h2>
        <p>Transférez vos USDC vers le Vault Obelisk</p>

        <div class="deposit-info">
          <div class="info-row">
            <span>Minimum:</span>
            <span>${this.features?.deposits?.min || 10} USDC</span>
          </div>
          <div class="info-row">
            <span>Maximum:</span>
            <span>${this.features?.deposits?.max || 10000} USDC</span>
          </div>
          <div class="info-row">
            <span>Frais de dépôt:</span>
            <span>${typeof FeeConfig !== 'undefined' ? (FeeConfig.DEPOSIT_FEE_PERCENT * 100).toFixed(1) : '0.3'}%</span>
          </div>
        </div>

        <div class="deposit-form">
          <label for="deposit-amount-real">Montant (USDC)</label>
          <input type="number" id="deposit-amount-real" min="10" max="10000" placeholder="100">

          <button class="btn-primary" id="btn-confirm-deposit">
            Connecter Wallet & Déposer
          </button>
        </div>

        <p class="deposit-note">
          Vous devez avoir des USDC sur Arbitrum dans votre wallet.
        </p>

        <button class="btn-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:500;';
    modal.querySelector('.obelisk-modal-content').style.cssText = 'background:#0a0a0f;border:1px solid #00ff88;border-radius:16px;padding:32px;max-width:400px;width:90%;color:#fff;position:relative;';
    modal.querySelector('.btn-close').style.cssText = 'position:absolute;top:10px;right:10px;background:none;border:none;color:#fff;font-size:24px;cursor:pointer;';
    modal.querySelector('.btn-primary').style.cssText = 'width:100%;padding:14px;background:linear-gradient(135deg,#00ff88,#00aaff);border:none;border-radius:8px;color:#0a0a0f;font-weight:700;cursor:pointer;margin-top:16px;';

    document.body.appendChild(modal);

    // Handle deposit
    modal.querySelector('#btn-confirm-deposit').onclick = async () => {
      const amount = parseFloat(document.getElementById('deposit-amount-real').value);
      if (!amount || amount < 10) {
        alert('Montant minimum: 10 USDC');
        return;
      }
      await this.executeDeposit(amount);
      modal.remove();
    };

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    // Make modal draggable by header
    const content = modal.querySelector('.obelisk-modal-content');
    const header = content.querySelector('h2');
    if (header) {
      header.style.cursor = 'move';
      header.style.userSelect = 'none';
      let isDragging = false, offsetX = 0, offsetY = 0;
      header.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = content.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        content.style.position = 'fixed';
        content.style.margin = '0';
        e.preventDefault();
      });
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        content.style.left = (e.clientX - offsetX) + 'px';
        content.style.top = (e.clientY - offsetY) + 'px';
        content.style.transform = 'none';
      });
      document.addEventListener('mouseup', () => { isDragging = false; });
    }
  },

  /**
   * Execute real deposit via smart contract
   */
  async executeDeposit(amount) {
    console.log('[ObeliskLive] Executing deposit:', amount);

    // Check for wallet
    if (typeof window.ethereum === 'undefined') {
      alert('Veuillez installer MetaMask ou un autre wallet compatible.');
      return;
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Check network (Arbitrum = 42161)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(chainId, 16) !== 42161) {
        alert('Veuillez vous connecter au réseau Arbitrum');
        // Try to switch network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa4b1' }] // 42161 in hex
          });
        } catch (switchError) {
          console.error('Failed to switch network:', switchError);
          return;
        }
      }

      // Use ethers.js if available
      if (typeof ethers !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // USDC contract on Arbitrum
        const usdcAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
        const vaultAddress = this.features?.contracts?.vault;

        if (!vaultAddress) {
          alert('Vault contract non configuré. Contactez le support.');
          return;
        }

        const usdcAbi = [
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function allowance(address owner, address spender) external view returns (uint256)',
          'function balanceOf(address account) external view returns (uint256)'
        ];

        const vaultAbi = [
          'function deposit(uint256 amount) external'
        ];

        const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
        const vault = new ethers.Contract(vaultAddress, vaultAbi, signer);

        const amountWei = ethers.parseUnits(amount.toString(), 6);

        // Check balance
        const balance = await usdc.balanceOf(await signer.getAddress());
        if (balance < amountWei) {
          alert(`Solde USDC insuffisant. Vous avez: ${ethers.formatUnits(balance, 6)} USDC`);
          return;
        }

        // Approve
        const allowance = await usdc.allowance(await signer.getAddress(), vaultAddress);
        if (allowance < amountWei) {
          console.log('[ObeliskLive] Approving USDC...');
          const approveTx = await usdc.approve(vaultAddress, ethers.MaxUint256);
          await approveTx.wait();
        }

        // Deposit
        console.log('[ObeliskLive] Depositing to vault...');
        const depositTx = await vault.deposit(amountWei);
        const receipt = await depositTx.wait();

        alert(`Dépôt réussi!\n\nMontant: ${amount} USDC\nTX: ${receipt.hash}`);

        // Refresh UI
        window.location.reload();

      } else {
        alert('ethers.js non disponible. Rechargez la page.');
      }

    } catch (err) {
      console.error('[ObeliskLive] Deposit failed:', err);
      alert(`Erreur: ${err.message || 'Transaction échouée'}`);
    }
  },

  /**
   * Show KYC required modal
   */
  showKYCRequiredModal() {
    const modal = document.createElement('div');
    modal.className = 'obelisk-modal';
    modal.innerHTML = `
      <div class="obelisk-modal-content">
        <h2>Vérification requise</h2>
        <p>Pour effectuer des transactions réelles, vous devez vérifier votre identité.</p>

        <div class="kyc-info">
          <p>✓ Processus rapide (2-5 min)</p>
          <p>✓ Documents acceptés: Passeport, Carte d'identité, Permis</p>
          <p>✓ Vos données sont sécurisées par Stripe</p>
        </div>

        <button class="btn-primary" onclick="ObeliskLive.startKYC(); this.parentElement.parentElement.remove();">
          Vérifier mon identité
        </button>

        <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">
          Plus tard
        </button>

        <button class="btn-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:500;';
    modal.querySelector('.obelisk-modal-content').style.cssText = 'background:#0a0a0f;border:1px solid #00ff88;border-radius:16px;padding:32px;max-width:400px;width:90%;color:#fff;position:relative;text-align:center;';

    document.body.appendChild(modal);
  },

  /**
   * Get DeFi positions
   */
  async getDefiPositions() {
    if (!this.isAuthenticated()) return [];

    try {
      const response = await fetch(`${this.apiUrl}/defi/positions`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      const data = await response.json();
      return data.positions || [];
    } catch (err) {
      console.error('[ObeliskLive] Failed to get positions:', err);
      return [];
    }
  },

  /**
   * Invest in Aave
   */
  async investAave(amount) {
    if (!this.isAuthenticated()) {
      alert('Veuillez vous connecter');
      return;
    }

    // Check KYC
    const kyc = await this.checkKYC();
    if (this.features?.kyc?.required && kyc.status !== 'verified') {
      this.showKYCRequiredModal();
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/defi/aave/deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Investissement réussi!\n\nMontant: ${amount} USDC\nAPY: ${data.apy}%\nTX: ${data.txHash}`);
        return data;
      } else {
        throw new Error(data.error || 'Investment failed');
      }
    } catch (err) {
      console.error('[ObeliskLive] Aave invest failed:', err);
      alert(`Erreur: ${err.message}`);
      return null;
    }
  }
};

// Auto-init
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    ObeliskLive.init();
  });
}

// Export
if (typeof window !== 'undefined') {
  window.ObeliskLive = ObeliskLive;
}

console.log('[ObeliskLive] Module loaded');
