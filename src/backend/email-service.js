/**
 * OBELISK Email Service
 * Send transactional emails via multiple providers
 *
 * Supports: Resend, SendGrid, Mailgun, SMTP
 * Setup: npm install resend (or your provider)
 */

// Email templates
const templates = {
    welcome: {
        subject: 'Welcome to OBELISK',
        html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to OBELISK</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020208; color: #e8f0ff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 32px; }
        .logo-icon { font-size: 48px; }
        .logo-text { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #00aaff, #8a2be2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .card { background: #0a0a18; border: 1px solid rgba(0,170,255,0.2); border-radius: 16px; padding: 32px; }
        h1 { color: #e8f0ff; font-size: 24px; margin: 0 0 16px; }
        p { color: #8ab4ff; line-height: 1.6; margin: 0 0 16px; }
        .button { display: inline-block; background: linear-gradient(135deg, #00aaff, #0088dd); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
        .features { margin: 24px 0; }
        .feature { display: flex; align-items: center; gap: 12px; margin: 12px 0; color: #8ab4ff; }
        .feature-icon { font-size: 20px; }
        .footer { text-align: center; margin-top: 32px; color: #4a6090; font-size: 12px; }
        .footer a { color: #00aaff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="logo-icon">◈</div>
            <div class="logo-text">OBELISK</div>
        </div>
        <div class="card">
            <h1>Welcome to OBELISK, ${data.displayName || 'Trader'}!</h1>
            <p>Your account has been created successfully. You're now part of the next generation of decentralized trading.</p>

            <div class="features">
                <div class="feature">
                    <span class="feature-icon">📈</span>
                    <span>Trade 24+ pairs with real-time prices</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">🔐</span>
                    <span>Non-custodial - Your keys, your crypto</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">💰</span>
                    <span>Earn passive income with staking & vaults</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">🤖</span>
                    <span>Automate with Grid Bots & DCA</span>
                </div>
            </div>

            <a href="${data.appUrl || 'https://obelisk.io'}" class="button">Start Trading</a>

            <p style="margin-top: 24px;">Need help getting started? Check out our <a href="${data.appUrl}/docs" style="color: #00aaff;">documentation</a> or join our <a href="https://discord.gg/obelisk" style="color: #00aaff;">Discord community</a>.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} OBELISK. All rights reserved.</p>
            <p><a href="${data.appUrl}/unsubscribe?token=${data.unsubscribeToken}">Unsubscribe</a> | <a href="${data.appUrl}/privacy">Privacy</a></p>
        </div>
    </div>
</body>
</html>
        `
    },

    emailVerification: {
        subject: 'Verify your email - OBELISK',
        html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, sans-serif; background: #020208; color: #e8f0ff; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .card { background: #0a0a18; border: 1px solid rgba(0,170,255,0.2); border-radius: 16px; padding: 32px; text-align: center; }
        h1 { color: #e8f0ff; }
        p { color: #8ab4ff; line-height: 1.6; }
        .button { display: inline-block; background: linear-gradient(135deg, #00aaff, #0088dd); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
        .code { font-size: 32px; letter-spacing: 8px; color: #00aaff; margin: 24px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Verify Your Email</h1>
            <p>Click the button below to verify your email address:</p>
            <a href="${data.verificationLink}" class="button">Verify Email</a>
            <p style="color: #4a6090; font-size: 12px;">Or copy this link: ${data.verificationLink}</p>
            <p style="color: #4a6090; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
    </div>
</body>
</html>
        `
    },

    tradeConfirmation: {
        subject: (data) => `Trade Executed: ${data.side.toUpperCase()} ${data.amount} ${data.pair}`,
        html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, sans-serif; background: #020208; color: #e8f0ff; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .card { background: #0a0a18; border: 1px solid rgba(0,170,255,0.2); border-radius: 16px; padding: 32px; }
        h1 { color: #e8f0ff; font-size: 20px; }
        .trade-details { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 20px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(138,180,255,0.1); }
        .row:last-child { border: none; }
        .label { color: #8ab4ff; }
        .value { color: #e8f0ff; font-weight: 600; }
        .buy { color: #00ff88; }
        .sell { color: #ff4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Trade Executed Successfully</h1>
            <div class="trade-details">
                <div class="row">
                    <span class="label">Type</span>
                    <span class="value ${data.side}">${data.side.toUpperCase()}</span>
                </div>
                <div class="row">
                    <span class="label">Pair</span>
                    <span class="value">${data.pair}</span>
                </div>
                <div class="row">
                    <span class="label">Amount</span>
                    <span class="value">${data.amount}</span>
                </div>
                <div class="row">
                    <span class="label">Price</span>
                    <span class="value">$${data.price}</span>
                </div>
                <div class="row">
                    <span class="label">Total</span>
                    <span class="value">$${(data.amount * data.price).toFixed(2)}</span>
                </div>
                <div class="row">
                    <span class="label">Fee</span>
                    <span class="value">$${data.fee || '0.00'}</span>
                </div>
                <div class="row">
                    <span class="label">Time</span>
                    <span class="value">${new Date(data.timestamp).toLocaleString()}</span>
                </div>
            </div>
            <p style="color: #4a6090; font-size: 12px; text-align: center;">Transaction ID: ${data.txId}</p>
        </div>
    </div>
</body>
</html>
        `
    },

    securityAlert: {
        subject: 'Security Alert - OBELISK',
        html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, sans-serif; background: #020208; color: #e8f0ff; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .card { background: #0a0a18; border: 1px solid #ff4444; border-radius: 16px; padding: 32px; }
        h1 { color: #ff6666; }
        p { color: #8ab4ff; line-height: 1.6; }
        .alert-box { background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.3); border-radius: 8px; padding: 16px; margin: 16px 0; }
        .button { display: inline-block; background: #ff4444; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>⚠️ Security Alert</h1>
            <p>We detected unusual activity on your account:</p>
            <div class="alert-box">
                <p><strong>Event:</strong> ${data.event}</p>
                <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${data.ip}</p>
                <p><strong>Location:</strong> ${data.location || 'Unknown'}</p>
            </div>
            <p>If this was you, you can ignore this email. If not, please secure your account immediately:</p>
            <a href="${data.appUrl}/security" class="button">Secure My Account</a>
        </div>
    </div>
</body>
</html>
        `
    }
};

// Email service class
class EmailService {
    constructor() {
        this.provider = null;
        this.from = process.env.EMAIL_FROM || 'OBELISK <noreply@obelisk.io>';
        this.init();
    }

    init() {
        // Try Resend first (recommended)
        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = require('resend');
                this.provider = new Resend(process.env.RESEND_API_KEY);
                this.providerName = 'resend';
                console.log('[EMAIL] Initialized with Resend');
                return;
            } catch (e) {
                console.warn('[EMAIL] Resend not available:', e.message);
            }
        }

        // Try SendGrid
        if (process.env.SENDGRID_API_KEY) {
            try {
                const sgMail = require('@sendgrid/mail');
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                this.provider = sgMail;
                this.providerName = 'sendgrid';
                console.log('[EMAIL] Initialized with SendGrid');
                return;
            } catch (e) {
                console.warn('[EMAIL] SendGrid not available:', e.message);
            }
        }

        console.warn('[EMAIL] No email provider configured. Set RESEND_API_KEY or SENDGRID_API_KEY');
    }

    async send(to, template, data) {
        if (!this.provider) {
            console.warn('[EMAIL] No provider, skipping email to:', to);
            return { success: false, error: 'No email provider configured' };
        }

        const tmpl = templates[template];
        if (!tmpl) {
            return { success: false, error: `Unknown template: ${template}` };
        }

        const subject = typeof tmpl.subject === 'function' ? tmpl.subject(data) : tmpl.subject;
        const html = tmpl.html(data);

        try {
            if (this.providerName === 'resend') {
                const result = await this.provider.emails.send({
                    from: this.from,
                    to,
                    subject,
                    html
                });
                console.log('[EMAIL] Sent via Resend:', to, template);
                return { success: true, id: result.id };
            }

            if (this.providerName === 'sendgrid') {
                await this.provider.send({
                    from: this.from,
                    to,
                    subject,
                    html
                });
                console.log('[EMAIL] Sent via SendGrid:', to, template);
                return { success: true };
            }

        } catch (error) {
            console.error('[EMAIL] Failed to send:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Convenience methods
    async sendWelcome(email, displayName) {
        return this.send(email, 'welcome', {
            displayName,
            appUrl: process.env.APP_URL || 'https://obelisk.io',
            unsubscribeToken: this.generateToken()
        });
    }

    async sendTradeConfirmation(email, trade) {
        return this.send(email, 'tradeConfirmation', trade);
    }

    async sendSecurityAlert(email, event, ip, location) {
        return this.send(email, 'securityAlert', {
            event,
            ip,
            location,
            timestamp: Date.now(),
            appUrl: process.env.APP_URL || 'https://obelisk.io'
        });
    }

    generateToken() {
        return require('crypto').randomBytes(32).toString('hex');
    }
}

// Singleton
const emailService = new EmailService();

module.exports = emailService;
