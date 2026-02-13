/**
 * OBELISK User Onboarding API
 * Track and guide new user setup
 */

const express = require('express');
const router = express.Router();

// Onboarding steps configuration
const ONBOARDING_STEPS = [
  {
    id: 'verify_email',
    title: 'Verify Email',
    description: 'Confirm your email address to secure your account',
    required: true,
    order: 1,
  },
  {
    id: 'connect_wallet',
    title: 'Connect Wallet',
    description: 'Connect your Web3 wallet (MetaMask, WalletConnect, etc.)',
    required: true,
    order: 2,
  },
  {
    id: 'complete_profile',
    title: 'Complete Profile',
    description: 'Add your display name and preferences',
    required: false,
    order: 3,
  },
  {
    id: 'read_terms',
    title: 'Accept Terms',
    description: 'Read and accept our Terms of Service and Privacy Policy',
    required: true,
    order: 4,
  },
  {
    id: 'read_risk',
    title: 'Acknowledge Risks',
    description: 'Understand the risks involved in cryptocurrency trading',
    required: true,
    order: 5,
  },
  {
    id: 'enable_2fa',
    title: 'Enable 2FA',
    description: 'Add two-factor authentication for extra security',
    required: false,
    order: 6,
  },
  {
    id: 'first_deposit',
    title: 'Make First Deposit',
    description: 'Fund your wallet to start trading',
    required: false,
    order: 7,
  },
  {
    id: 'first_trade',
    title: 'Complete First Trade',
    description: 'Execute your first trade on OBELISK',
    required: false,
    order: 8,
  },
];

// In-memory progress store (replace with database in production)
const userProgress = new Map();

/**
 * GET /api/onboarding/steps
 * Get all onboarding steps with user progress
 */
router.get('/steps', (req, res) => {
  const userId = req.user?.id;
  const progress = userId ? (userProgress.get(userId) || {}) : {};

  const steps = ONBOARDING_STEPS.map(step => ({
    ...step,
    completed: !!progress[step.id],
    completedAt: progress[step.id] || null,
  }));

  const completed = steps.filter(s => s.completed).length;
  const total = steps.length;
  const requiredCompleted = steps.filter(s => s.required && s.completed).length;
  const requiredTotal = steps.filter(s => s.required).length;

  res.json({
    steps,
    progress: {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
      requiredCompleted,
      requiredTotal,
      canTrade: requiredCompleted === requiredTotal,
    },
    nextStep: steps.find(s => !s.completed && s.required) || steps.find(s => !s.completed),
  });
});

/**
 * POST /api/onboarding/complete/:stepId
 * Mark a step as completed
 */
router.post('/complete/:stepId', (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { stepId } = req.params;
  const step = ONBOARDING_STEPS.find(s => s.id === stepId);

  if (!step) {
    return res.status(404).json({ error: 'Step not found' });
  }

  // Get or create user progress
  let progress = userProgress.get(userId);
  if (!progress) {
    progress = {};
    userProgress.set(userId, progress);
  }

  // Mark step as completed
  if (!progress[stepId]) {
    progress[stepId] = new Date().toISOString();
  }

  // Check if all required steps are done
  const requiredSteps = ONBOARDING_STEPS.filter(s => s.required);
  const allRequiredDone = requiredSteps.every(s => progress[s.id]);

  res.json({
    success: true,
    step: {
      ...step,
      completed: true,
      completedAt: progress[stepId],
    },
    allRequiredDone,
    message: allRequiredDone
      ? 'All required steps completed! You can now trade.'
      : `Step "${step.title}" completed!`,
  });
});

/**
 * POST /api/onboarding/reset
 * Reset onboarding progress (for testing)
 */
router.post('/reset', (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  userProgress.delete(userId);

  res.json({
    success: true,
    message: 'Onboarding progress reset',
  });
});

/**
 * GET /api/onboarding/checklist
 * Get a simple checklist for the UI
 */
router.get('/checklist', (req, res) => {
  const userId = req.user?.id;
  const progress = userId ? (userProgress.get(userId) || {}) : {};

  const checklist = ONBOARDING_STEPS
    .filter(s => s.required)
    .map(s => ({
      id: s.id,
      label: s.title,
      done: !!progress[s.id],
    }));

  res.json({
    checklist,
    allDone: checklist.every(c => c.done),
  });
});

/**
 * GET /api/onboarding/tips
 * Get contextual tips for new users
 */
router.get('/tips', (req, res) => {
  const tips = [
    {
      id: 'security',
      title: 'Keep Your Keys Safe',
      content: 'Never share your private keys or seed phrase. OBELISK will never ask for them.',
      icon: '🔐',
    },
    {
      id: 'start_small',
      title: 'Start Small',
      content: 'Begin with small trades to learn the platform before investing larger amounts.',
      icon: '📊',
    },
    {
      id: 'dyor',
      title: 'Do Your Own Research',
      content: 'Always research assets before trading. Past performance doesn\'t guarantee future results.',
      icon: '🔍',
    },
    {
      id: 'risk',
      title: 'Only Risk What You Can Lose',
      content: 'Cryptocurrency is volatile. Never invest money you can\'t afford to lose.',
      icon: '⚠️',
    },
    {
      id: 'fees',
      title: 'Understand Fees',
      content: 'OBELISK charges 0.1% per trade. Always account for network fees (gas) too.',
      icon: '💰',
    },
    {
      id: 'alerts',
      title: 'Set Price Alerts',
      content: 'Use price alerts to never miss trading opportunities while away.',
      icon: '🔔',
    },
  ];

  res.json({ tips });
});

/**
 * GET /api/onboarding/tour
 * Get guided tour configuration for the UI
 */
router.get('/tour', (req, res) => {
  const tour = {
    enabled: true,
    steps: [
      {
        target: '#markets-panel',
        title: 'Markets Overview',
        content: 'View real-time prices for all trading pairs. Click any pair to see details.',
        placement: 'right',
      },
      {
        target: '#wallet-connect',
        title: 'Connect Wallet',
        content: 'Connect your Web3 wallet to start trading. We support MetaMask, WalletConnect, and more.',
        placement: 'bottom',
      },
      {
        target: '#order-form',
        title: 'Place Orders',
        content: 'Buy or sell crypto instantly. Set limit orders to trade at your preferred price.',
        placement: 'left',
      },
      {
        target: '#portfolio',
        title: 'Your Portfolio',
        content: 'Track your holdings, PnL, and trading history all in one place.',
        placement: 'bottom',
      },
      {
        target: '#passive-income',
        title: 'Passive Income',
        content: 'Earn 4-20% APY with staking, vaults, and yield strategies.',
        placement: 'left',
      },
    ],
  };

  res.json(tour);
});

module.exports = router;
