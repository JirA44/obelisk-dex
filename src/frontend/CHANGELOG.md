# Obelisk DEX - Changelog

## v2.5.0 "Galaxy" (2026-01-09)

### New Features
- **Galaxy Theme**: Animated background with planets (various sizes/colors), some with rings and moons, stars, nebulas, and asteroids
- **Ocean Theme**: Underwater environment with fish, bubbles, seaweed, light rays, and plankton particles
- **UI Verifier**: Comprehensive diagnostics tool to check all tabs and modules (`UIVerifier.verify()`)
- **Versioning System**: Full changelog tracking with `VersioningSystem.showVersionModal()`
- **Backup System**: Export/import user data with `BackupSystem.showBackupModal()`
- **Auto-backup**: Saves user data every 5 minutes to prevent data loss

### Fixes
- Fixed combo modal overflow - now scrollable with max-height 85vh
- Fixed Settings tab display issues
- Fixed Learn tab display issues
- Improved force initialization for all modules

### Improvements
- Expanded combos to 82+ products (53 static + 10 generated ultra combos)
- Enhanced tab verification and auto-fix capabilities

---

## v2.4.0 "Expansion" (2026-01-08)

### New Features
- **Bonds Module**: 45 bond products (Treasury, Corporate, Municipal, etc.)
- **Copy Trading Module**: 45 professional traders to follow
- **Insurance Module**: 40 insurance policies (Smart Contract, Bridge, etc.)
- **Launchpad Module**: 40 upcoming projects
- **Predictions Module**: 45 prediction markets
- **Structured Products Module**: 40 structured investment products
- **RWA Module**: 45 real-world assets (Real Estate, Commodities, etc.)
- **NFT Staking Module**: 40 NFT collections with staking
- **Lottery Module**: 25 lottery pools
- **Algo Strategies Module**: 45 algorithmic trading strategies
- **Social Trading Module**: 45 social trading features
- **Flash Loans Module**: 40 flash loan pools

---

## v2.3.0 "Themes" (2026-01-07)

### New Features
- **Avatar Bioluminescent Theme**: Glowing particles inspired by Pandora
- **Halo Forerunner Theme**: Ancient alien tech hexagons
- **Matrix Theme**: Digital rain with multiple color options
- **Particles Theme**: Floating connected particles

### Improvements
- Theme persistence in localStorage
- Animation speed control

---

## v2.2.0 "Security" (2026-01-06)

### New Features
- **Post-Quantum Cryptography**: CRYSTALS-Kyber, Dilithium, SPHINCS+
- **Security Modules** (10 total):
  - Quantum Shield
  - Contract Guards
  - Circuit Breaker
  - Oracle Security
  - Security Monitor
  - Anomaly Detector
  - Infrastructure Security
  - DeFi Security
  - Social Security
  - Zero-Day Shield

---

## v2.1.0 "Trading" (2026-01-05)

### New Features
- Real-time price updates from multiple DEX sources
- TradingView chart integration
- Obelisk native chart option (0.1ms updates)
- Demo trading mode (paper trading)

### Improvements
- Improved orderbook display
- Price per second (PPS) counter

---

## v2.0.0 "Genesis" (2026-01-01)

### Initial Release
- Non-custodial wallet creation with seed phrase
- Post-quantum secure encryption
- Simulated portfolio system
- Investment products:
  - Staking
  - Vaults
  - Lending
  - Liquidity Pools
  - Yield Farming
  - Options
  - Perpetuals
  - Leveraged Tokens
- Multi-language support (EN, FR, ES, DE, JP, KO, ZH)
- Dark cyber theme
- Zero server storage architecture

---

## Console Commands

```javascript
// UI Verifier
UIVerifier.verify()           // Run full verification
UIVerifier.autoFix()          // Auto-fix common issues
UIVerifier.createStatusPanel() // Show status panel

// Versioning
VersioningSystem.getVersion()      // Get current version
VersioningSystem.showVersionModal() // Show changelog modal
VersioningSystem.checkForUpdates()  // Check for updates

// Backup
BackupSystem.exportBackup()   // Download backup file
BackupSystem.showBackupModal() // Show backup UI
BackupSystem.autoBackup()     // Save auto-backup
BackupSystem.getStats()       // Get storage stats

// Force Init
ForceInit.reinit()            // Reinitialize all modules
ForceInit.renderAll()         // Force re-render all UI
ForceInit.verifyTabs()        // Verify tabs content
ForceInit.showPanel()         // Show capital panel
```

---

## File Structure

```
obelisk-dex/
├── index.html              # Main application
├── CHANGELOG.md            # This file
├── css/
│   ├── main.css           # Main styles
│   └── themes/            # Theme styles
├── js/
│   ├── core/
│   │   ├── app.js         # Main application logic
│   │   ├── bg-animations.js # Background themes
│   │   ├── force-init.js   # Module initialization
│   │   ├── ui-verifier.js  # UI diagnostics
│   │   ├── versioning.js   # Version tracking
│   │   └── backup-system.js # Backup/restore
│   ├── products/          # Investment modules
│   ├── portfolio/         # Portfolio management
│   ├── trading/           # Trading features
│   ├── wallet/            # Wallet management
│   └── utils/             # Utility modules
└── security/              # Security modules
```
