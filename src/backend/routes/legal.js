/**
 * OBELISK Legal Pages
 * Terms of Service, Privacy Policy, etc.
 */

const express = require('express');
const router = express.Router();

const COMPANY_NAME = 'OBELISK';
const COMPANY_EMAIL = 'legal@obelisk.trading';
const EFFECTIVE_DATE = '2025-01-01';

// ===========================================
// TERMS OF SERVICE
// ===========================================

router.get('/terms', (req, res) => {
  res.json({
    title: 'Terms of Service',
    effectiveDate: EFFECTIVE_DATE,
    lastUpdated: EFFECTIVE_DATE,
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: `By accessing or using ${COMPANY_NAME} ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.`,
      },
      {
        title: '2. Eligibility',
        content: 'You must be at least 18 years old and legally capable of entering into contracts. The Platform is not available in jurisdictions where cryptocurrency trading is prohibited.',
      },
      {
        title: '3. Non-Custodial Service',
        content: `${COMPANY_NAME} is a non-custodial platform. We never hold, store, or have access to your private keys or funds. You are solely responsible for securing your wallet and private keys.`,
      },
      {
        title: '4. Risk Disclosure',
        content: `Cryptocurrency trading involves substantial risk of loss. Prices are highly volatile. Past performance does not guarantee future results. You may lose some or all of your investment. Only trade with funds you can afford to lose. ${COMPANY_NAME} is not responsible for any trading losses.`,
      },
      {
        title: '5. No Financial Advice',
        content: `${COMPANY_NAME} does not provide financial, investment, legal, or tax advice. All information provided is for informational purposes only. You should consult professional advisors before making investment decisions.`,
      },
      {
        title: '6. Account Security',
        content: 'You are responsible for maintaining the security of your account credentials, API keys, and connected wallets. Notify us immediately of any unauthorized access.',
      },
      {
        title: '7. Prohibited Activities',
        content: 'You may not: (a) use the Platform for illegal activities; (b) attempt to manipulate markets; (c) use bots to abuse the Platform; (d) circumvent security measures; (e) infringe on intellectual property rights.',
      },
      {
        title: '8. Fees',
        content: 'The Platform charges a 0.1% fee on trades. Network fees (gas) are separate and paid directly to the blockchain. Fee structures may change with notice.',
      },
      {
        title: '9. Service Availability',
        content: `${COMPANY_NAME} strives for 99.9% uptime but does not guarantee uninterrupted service. We are not liable for losses due to downtime, bugs, or third-party service failures.`,
      },
      {
        title: '10. Limitation of Liability',
        content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${COMPANY_NAME.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR FUNDS.`,
      },
      {
        title: '11. Indemnification',
        content: `You agree to indemnify and hold harmless ${COMPANY_NAME}, its affiliates, and their respective officers, directors, employees, and agents from any claims arising from your use of the Platform.`,
      },
      {
        title: '12. Modifications',
        content: 'We may modify these Terms at any time. Continued use after modifications constitutes acceptance. Material changes will be notified via email or Platform announcement.',
      },
      {
        title: '13. Governing Law',
        content: 'These Terms are governed by the laws of the jurisdiction where the company is incorporated, without regard to conflict of law principles.',
      },
      {
        title: '14. Contact',
        content: `For questions about these Terms, contact us at ${COMPANY_EMAIL}.`,
      },
    ],
  });
});

// ===========================================
// PRIVACY POLICY
// ===========================================

router.get('/privacy', (req, res) => {
  res.json({
    title: 'Privacy Policy',
    effectiveDate: EFFECTIVE_DATE,
    lastUpdated: EFFECTIVE_DATE,
    sections: [
      {
        title: '1. Introduction',
        content: `${COMPANY_NAME} ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.`,
      },
      {
        title: '2. Information We Collect',
        content: 'We collect: (a) Email address (for account creation); (b) Wallet addresses (public, for trading); (c) IP address and device information (for security); (d) Trading activity (for analytics); (e) Communications with support.',
      },
      {
        title: '3. Information We Do NOT Collect',
        content: 'We NEVER collect or store: (a) Private keys; (b) Seed phrases; (c) Passwords in plain text; (d) Sensitive financial information beyond what is publicly visible on the blockchain.',
      },
      {
        title: '4. How We Use Information',
        content: 'We use your information to: (a) Provide and improve our services; (b) Process transactions; (c) Send important notifications; (d) Prevent fraud and abuse; (e) Comply with legal obligations; (f) Generate anonymized analytics.',
      },
      {
        title: '5. Data Sharing',
        content: 'We do not sell your personal data. We may share data with: (a) Service providers (hosting, email, analytics); (b) Legal authorities when required by law; (c) In connection with a merger or acquisition.',
      },
      {
        title: '6. Blockchain Transparency',
        content: 'Transactions on public blockchains are visible to anyone. We cannot control or hide on-chain activity. Your wallet address and transaction history are public.',
      },
      {
        title: '7. Data Security',
        content: 'We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no system is 100% secure.',
      },
      {
        title: '8. Data Retention',
        content: 'We retain account data as long as your account is active. You may request deletion of your account and associated data, subject to legal retention requirements.',
      },
      {
        title: '9. Cookies',
        content: 'We use essential cookies for authentication and security. We may use analytics cookies to improve the Platform. You can disable cookies in your browser settings.',
      },
      {
        title: '10. Your Rights',
        content: 'Depending on your jurisdiction, you may have rights to: (a) Access your data; (b) Correct inaccurate data; (c) Delete your data; (d) Export your data; (e) Opt out of marketing.',
      },
      {
        title: '11. Children',
        content: 'The Platform is not intended for users under 18. We do not knowingly collect data from minors.',
      },
      {
        title: '12. International Transfers',
        content: 'Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.',
      },
      {
        title: '13. Changes to Policy',
        content: 'We may update this Privacy Policy. We will notify you of material changes via email or Platform announcement.',
      },
      {
        title: '14. Contact',
        content: `For privacy inquiries, contact us at ${COMPANY_EMAIL} or submit a request through the Platform.`,
      },
    ],
  });
});

// ===========================================
// RISK DISCLOSURE
// ===========================================

router.get('/risk-disclosure', (req, res) => {
  res.json({
    title: 'Risk Disclosure',
    effectiveDate: EFFECTIVE_DATE,
    content: `
## IMPORTANT RISK DISCLOSURE

### 1. General Risks
Cryptocurrency trading involves substantial risk. Prices can fluctuate dramatically in short periods. You may lose part or all of your investment.

### 2. Volatility
Cryptocurrencies are highly volatile assets. Price swings of 10-50% in a single day are not uncommon. Historical performance does not predict future results.

### 3. Leverage Risk
If you use leverage (borrowed funds), your potential gains AND losses are magnified. A small price movement can result in significant losses, potentially exceeding your initial investment.

### 4. Liquidity Risk
Some assets may have low liquidity, making it difficult to execute trades at desired prices or to exit positions quickly.

### 5. Smart Contract Risk
DeFi protocols rely on smart contracts that may contain bugs or vulnerabilities. Exploits can result in total loss of funds.

### 6. Regulatory Risk
Cryptocurrency regulations vary by jurisdiction and may change. Regulatory actions could affect asset values or your ability to trade.

### 7. Technology Risk
The Platform depends on blockchain networks, internet connectivity, and third-party services. Technical failures, hacks, or outages can prevent trading or cause losses.

### 8. Counterparty Risk
When trading on DEXs, you interact with smart contracts and liquidity providers. There is risk that these counterparties may not perform as expected.

### 9. Tax Implications
Cryptocurrency trading may have tax consequences. You are responsible for understanding and complying with tax laws in your jurisdiction.

### 10. Your Responsibility
- Only invest what you can afford to lose
- Do your own research before trading
- Understand the assets and protocols you interact with
- Use proper security practices
- Consider consulting a financial advisor

By using ${COMPANY_NAME}, you acknowledge that you understand these risks and accept full responsibility for your trading decisions.
    `.trim(),
  });
});

// ===========================================
// COOKIE POLICY
// ===========================================

router.get('/cookies', (req, res) => {
  res.json({
    title: 'Cookie Policy',
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      {
        title: 'What Are Cookies',
        content: 'Cookies are small text files stored on your device when you visit a website. They help the website remember information about your visit.',
      },
      {
        title: 'Cookies We Use',
        content: 'Essential cookies: Required for authentication and security (session tokens, CSRF tokens). Analytics cookies: Help us understand how users interact with the Platform (optional).',
      },
      {
        title: 'Managing Cookies',
        content: 'You can disable cookies in your browser settings. However, disabling essential cookies will prevent you from using the Platform.',
      },
    ],
  });
});

// ===========================================
// SECURITY POLICY
// ===========================================

router.get('/security', (req, res) => {
  res.json({
    title: 'Security Policy',
    content: {
      nonCustodial: 'We never hold your private keys or funds. You maintain full control of your assets.',
      encryption: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256).',
      authentication: 'We use secure password hashing (bcrypt), JWT tokens, and optional 2FA.',
      monitoring: 'We monitor for suspicious activity and may temporarily lock accounts to protect users.',
      bugBounty: `If you discover a security vulnerability, please report it to security@obelisk.trading. We offer rewards for responsible disclosure.`,
      practices: [
        'Never share your private keys or seed phrases',
        'Use a hardware wallet for large holdings',
        'Enable 2FA on your account',
        'Use unique, strong passwords',
        'Verify URLs before connecting your wallet',
        'Be wary of phishing attempts',
      ],
    },
  });
});

module.exports = router;
