/**
 * OBELISK Feature Flags Configuration
 *
 * Contrôle quelles fonctionnalités sont actives (DEMO vs LIVE)
 * Modifier .env pour changer les modes sans toucher au code
 */

const features = {
  // ===========================================
  // GLOBAL MODE
  // ===========================================
  MODE: process.env.MODE || 'DEMO', // 'DEMO' | 'LIVE' | 'MAINTENANCE'

  // ===========================================
  // CORE FEATURES
  // ===========================================

  // Trading
  TRADING_ENABLED: toBool(process.env.FEATURE_TRADING, true),
  TRADING_REAL_EXECUTION: toBool(process.env.FEATURE_TRADING_REAL, false),

  // Deposits & Withdrawals
  DEPOSITS_ENABLED: toBool(process.env.FEATURE_DEPOSITS, false),
  WITHDRAWALS_ENABLED: toBool(process.env.FEATURE_WITHDRAWALS, false),
  MIN_DEPOSIT: parseFloat(process.env.MIN_DEPOSIT) || 10, // USDC
  MAX_DEPOSIT: parseFloat(process.env.MAX_DEPOSIT) || 10000, // USDC

  // DeFi Integrations
  DEFI_AAVE_ENABLED: toBool(process.env.FEATURE_AAVE, false),
  DEFI_GMX_ENABLED: toBool(process.env.FEATURE_GMX, false),
  DEFI_AERODROME_ENABLED: toBool(process.env.FEATURE_AERODROME, false),

  // KYC/AML
  KYC_REQUIRED: toBool(process.env.FEATURE_KYC_REQUIRED, false),
  KYC_PROVIDER: process.env.KYC_PROVIDER || 'stripe', // 'stripe' | 'jumio' | 'none'

  // ===========================================
  // LIMITS (adjustable per mode)
  // ===========================================

  // Position limits
  MAX_POSITION_SIZE: parseFloat(process.env.MAX_POSITION_SIZE) || 1000,
  MAX_LEVERAGE: parseFloat(process.env.MAX_LEVERAGE) || 10,

  // Rate limits
  MAX_ORDERS_PER_MINUTE: parseInt(process.env.MAX_ORDERS_PER_MINUTE) || 30,
  MAX_API_CALLS_PER_MINUTE: parseInt(process.env.MAX_API_CALLS_PER_MINUTE) || 100,

  // ===========================================
  // SMART CONTRACTS (Arbitrum)
  // ===========================================

  VAULT_CONTRACT: process.env.VAULT_CONTRACT || null,
  USDC_CONTRACT: process.env.USDC_CONTRACT || '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC

  // ===========================================
  // DEMO MODE SETTINGS
  // ===========================================

  DEMO_STARTING_BALANCE: parseFloat(process.env.DEMO_STARTING_BALANCE) || 10000,
  DEMO_SHOW_BANNER: toBool(process.env.DEMO_SHOW_BANNER, true),
};

// Helper to parse boolean env vars
function toBool(val, defaultVal = false) {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === 'boolean') return val;
  return val.toLowerCase() === 'true' || val === '1';
}

// ===========================================
// MODE PRESETS
// ===========================================

const PRESETS = {
  DEMO: {
    TRADING_REAL_EXECUTION: false,
    DEPOSITS_ENABLED: false,
    WITHDRAWALS_ENABLED: false,
    DEFI_AAVE_ENABLED: false,
    DEFI_GMX_ENABLED: false,
    KYC_REQUIRED: false,
    DEMO_SHOW_BANNER: true,
  },
  BETA: {
    TRADING_REAL_EXECUTION: false,
    DEPOSITS_ENABLED: true,
    WITHDRAWALS_ENABLED: true,
    DEFI_AAVE_ENABLED: true,
    DEFI_GMX_ENABLED: false,
    KYC_REQUIRED: true,
    MAX_DEPOSIT: 1000,
    DEMO_SHOW_BANNER: false,
  },
  LIVE: {
    TRADING_REAL_EXECUTION: true,
    DEPOSITS_ENABLED: true,
    WITHDRAWALS_ENABLED: true,
    DEFI_AAVE_ENABLED: true,
    DEFI_GMX_ENABLED: true,
    KYC_REQUIRED: true,
    DEMO_SHOW_BANNER: false,
  },
};

// Apply preset based on MODE
function getConfig() {
  const mode = features.MODE;
  const preset = PRESETS[mode] || PRESETS.DEMO;

  // Merge: preset < env vars (env vars override preset)
  const config = { ...features };

  for (const [key, value] of Object.entries(preset)) {
    // Only apply preset if env var not explicitly set
    const envKey = `FEATURE_${key}`;
    if (process.env[envKey] === undefined) {
      config[key] = value;
    }
  }

  return config;
}

// ===========================================
// RUNTIME CHECKS
// ===========================================

function isLiveMode() {
  return features.MODE === 'LIVE';
}

function isDemoMode() {
  return features.MODE === 'DEMO';
}

function isBetaMode() {
  return features.MODE === 'BETA';
}

function canDeposit() {
  const config = getConfig();
  return config.DEPOSITS_ENABLED;
}

function canWithdraw() {
  const config = getConfig();
  return config.WITHDRAWALS_ENABLED;
}

function canTradeReal() {
  const config = getConfig();
  return config.TRADING_REAL_EXECUTION;
}

function requiresKYC() {
  const config = getConfig();
  return config.KYC_REQUIRED;
}

function getFeatureStatus() {
  const config = getConfig();
  return {
    mode: config.MODE,
    trading: {
      enabled: config.TRADING_ENABLED,
      realExecution: config.TRADING_REAL_EXECUTION,
      maxPosition: config.MAX_POSITION_SIZE,
      maxLeverage: config.MAX_LEVERAGE,
    },
    deposits: {
      enabled: config.DEPOSITS_ENABLED,
      min: config.MIN_DEPOSIT,
      max: config.MAX_DEPOSIT,
    },
    withdrawals: {
      enabled: config.WITHDRAWALS_ENABLED,
    },
    defi: {
      aave: config.DEFI_AAVE_ENABLED,
      gmx: config.DEFI_GMX_ENABLED,
      aerodrome: config.DEFI_AERODROME_ENABLED,
    },
    kyc: {
      required: config.KYC_REQUIRED,
      provider: config.KYC_PROVIDER,
    },
    demo: {
      showBanner: config.DEMO_SHOW_BANNER,
      startingBalance: config.DEMO_STARTING_BALANCE,
    },
    contracts: {
      vault: config.VAULT_CONTRACT,
      usdc: config.USDC_CONTRACT,
    },
  };
}

module.exports = {
  features,
  getConfig,
  getFeatureStatus,
  isLiveMode,
  isDemoMode,
  isBetaMode,
  canDeposit,
  canWithdraw,
  canTradeReal,
  requiresKYC,
  PRESETS,
};
