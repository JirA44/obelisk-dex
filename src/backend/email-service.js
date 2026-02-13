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

    sosAlert: {
        subject: 'URGENT SOS ALERT - OBELISK',
        html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, sans-serif; background: #1a0000; color: #e8f0ff; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .card { background: #0a0a18; border: 2px solid #ff0000; border-radius: 16px; padding: 32px; }
        h1 { color: #ff0000; font-size: 28px; }
        p { color: #e8f0ff; line-height: 1.6; }
        .alert-box { background: rgba(255,0,0,0.15); border: 1px solid rgba(255,0,0,0.5); border-radius: 8px; padding: 20px; margin: 16px 0; }
        .coords { font-family: monospace; font-size: 18px; color: #ff6666; letter-spacing: 1px; }
        .map-link { display: inline-block; background: #ff0000; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>SOS EMERGENCY ALERT</h1>
            <div class="alert-box">
                <p><strong>User:</strong> ${data.userId || 'Anonymous'}</p>
                <p><strong>Wallet:</strong> ${data.wallet || 'N/A'}</p>
                <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                <p><strong>IP:</strong> ${data.ip || 'Unknown'}</p>
                <p><strong>GPS Coordinates:</strong></p>
                <p class="coords">${data.lat}, ${data.lng}</p>
                ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
            </div>
            <a href="https://maps.google.com/?q=${data.lat},${data.lng}" class="map-link">Open in Google Maps</a>
            <p style="color: #ff6666; font-size: 14px; margin-top: 16px;">This is an automated emergency alert from OBELISK DEX. Please verify and take appropriate action.</p>
        </div>
    </div>
</body>
</html>
        `
    },

    suspiciousActivity: {
        subject: (data) => `[${data.severity.toUpperCase()}] Suspicious Activity Detected - OBELISK`,
        html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, sans-serif; background: #020208; color: #e8f0ff; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .card { background: #0a0a18; border: 1px solid #ff8800; border-radius: 16px; padding: 32px; }
        h1 { color: #ff8800; }
        p { color: #8ab4ff; line-height: 1.6; }
        .alert-box { background: rgba(255,136,0,0.1); border: 1px solid rgba(255,136,0,0.3); border-radius: 8px; padding: 16px; margin: 12px 0; }
        .flag { display: inline-block; background: rgba(255,68,68,0.2); color: #ff6666; padding: 4px 10px; border-radius: 4px; font-size: 13px; margin: 4px 2px; }
        .score { font-size: 36px; font-weight: bold; }
        .score.critical { color: #ff0000; }
        .score.high { color: #ff8800; }
        .score.medium { color: #ffcc00; }
        .score.low { color: #00ff88; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Suspicious Activity Alert</h1>
            <div class="alert-box">
                <p><strong>User:</strong> ${data.wallet || data.userId}</p>
                <p><strong>Risk Score:</strong> <span class="score ${data.severity}">${data.riskScore}/100</span></p>
                <p><strong>Severity:</strong> ${data.severity.toUpperCase()}</p>
                <p><strong>Detected:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            </div>
            <p><strong>Flags:</strong></p>
            <div>${(data.flags || []).map(f => `<span class="flag">${f}</span>`).join(' ')}</div>
            <p style="margin-top: 20px;">Review this account in the compliance dashboard.</p>
        </div>
    </div>
</body>
</html>
        `
    },

    accountFlagged: {
        subject: 'Account Flagged for Review - OBELISK',
        html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, sans-serif; background: #020208; color: #e8f0ff; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .card { background: #0a0a18; border: 1px solid #ff4444; border-radius: 16px; padding: 32px; }
        h1 { color: #ff4444; }
        p { color: #8ab4ff; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Account Flagged</h1>
            <p><strong>Wallet:</strong> ${data.wallet || data.userId}</p>
            <p><strong>Reason:</strong> ${data.reason}</p>
            <p><strong>Risk Score:</strong> ${data.riskScore}/100</p>
            <p><strong>Flagged by:</strong> ${data.flaggedBy || 'System'}</p>
            <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            <p style="margin-top: 20px;">A compliance dossier should be generated for investigation.</p>
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

    async sendSosAlert(data) {
        const recipients = this.getComplianceRecipients();
        const results = [];
        for (const email of recipients) {
            results.push(await this.send(email, 'sosAlert', { ...data, timestamp: Date.now() }));
        }
        // Also send SMS
        await smsService.sendSos(data);
        return results;
    }

    async sendSuspiciousActivityAlert(data) {
        const recipients = this.getComplianceRecipients();
        const results = [];
        for (const email of recipients) {
            results.push(await this.send(email, 'suspiciousActivity', { ...data, timestamp: Date.now() }));
        }
        // SMS for critical alerts
        if (data.severity === 'critical') {
            await smsService.sendAlert(`OBELISK CRITICAL: Suspicious activity on ${data.wallet || data.userId}, risk ${data.riskScore}/100`);
        }
        return results;
    }

    async sendAccountFlaggedAlert(data) {
        const recipients = this.getComplianceRecipients();
        const results = [];
        for (const email of recipients) {
            results.push(await this.send(email, 'accountFlagged', { ...data, timestamp: Date.now() }));
        }
        return results;
    }

    getComplianceRecipients() {
        const env = process.env.COMPLIANCE_EMAILS || process.env.ADMIN_EMAIL || '';
        return env.split(',').map(e => e.trim()).filter(e => e.length > 0);
    }

    generateToken() {
        return require('crypto').randomBytes(32).toString('hex');
    }
}

// ==================== SMS SERVICE (Twilio) ====================

class SmsService {
    constructor() {
        this.client = null;
        this.from = null;
        this.init();
    }

    init() {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_FROM) {
            try {
                const twilio = require('twilio');
                this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                this.from = process.env.TWILIO_PHONE_FROM;
                console.log('[SMS] Initialized with Twilio');
            } catch (e) {
                console.warn('[SMS] Twilio not available:', e.message);
            }
        } else {
            console.warn('[SMS] No SMS provider configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_FROM');
        }
    }

    getCompliancePhones() {
        const env = process.env.COMPLIANCE_PHONES || process.env.ADMIN_PHONE || '';
        return env.split(',').map(p => p.trim()).filter(p => p.length > 0);
    }

    async sendSms(to, body) {
        if (!this.client) {
            console.warn('[SMS] No provider, skipping SMS to:', to);
            return { success: false, error: 'No SMS provider' };
        }
        try {
            const msg = await this.client.messages.create({
                body,
                from: this.from,
                to
            });
            console.log('[SMS] Sent to', to, '- SID:', msg.sid);
            return { success: true, sid: msg.sid };
        } catch (err) {
            console.error('[SMS] Failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    async sendSos(data) {
        const phones = this.getCompliancePhones();
        const mapsUrl = `https://maps.google.com/?q=${data.lat},${data.lng}`;
        const body = `SOS OBELISK ALERT\nUser: ${data.userId || 'Anonymous'}\nGPS: ${data.lat}, ${data.lng}\n${data.message || ''}\nMap: ${mapsUrl}`;
        const results = [];
        for (const phone of phones) {
            results.push(await this.sendSms(phone, body));
        }
        return results;
    }

    async sendAlert(message) {
        const phones = this.getCompliancePhones();
        const results = [];
        for (const phone of phones) {
            results.push(await this.sendSms(phone, message));
        }
        return results;
    }
}

// Singletons
const emailService = new EmailService();
const smsService = new SmsService();

module.exports = { emailService, smsService, templates };
