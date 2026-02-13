/**
 * CRYPTO PAYROLL - B2B & B2C Payment Service
 * Manage recurring crypto payments for businesses and individuals
 * Auto-convert, schedule, and track payroll with flexible frequencies
 */
const CryptoPayroll = {
    // Company profiles
    companies: [],

    // Employees/Recipients
    recipients: [],

    // Payment schedules
    schedules: [],

    // Payment history
    payments: [],

    // Supported currencies
    currencies: {
        USDC: { icon: '💵', decimals: 6 },
        USDT: { icon: '💲', decimals: 6 },
        ETH: { icon: 'Ξ', decimals: 18 },
        BTC: { icon: '₿', decimals: 8 },
        EUR: { icon: '€', type: 'fiat', rate: 0.92 },
        USD: { icon: '$', type: 'fiat', rate: 1 }
    },

    // Recipient types
    recipientTypes: {
        b2b: { name: 'B2B', icon: '🏢', desc: 'Business/Company' },
        b2c: { name: 'B2C', icon: '👤', desc: 'Individual/Employee' }
    },

    // Payment frequencies
    frequencies: {
        daily: { name: 'Daily', days: 1, icon: '📅' },
        weekly: { name: 'Weekly', days: 7, icon: '📆' },
        biweekly: { name: 'Bi-weekly', days: 14, icon: '🗓️' },
        monthly: { name: 'Monthly', days: 30, icon: '📋' },
        custom: { name: 'Custom', days: null, icon: '⚙️' }
    },

    init() {
        this.load();
        this.startPaymentScheduler();
        console.log('[CryptoPayroll] Initialized');
    },

    load() {
        this.companies = JSON.parse(localStorage.getItem('obelisk_payroll_companies') || '[]');
        this.recipients = JSON.parse(localStorage.getItem('obelisk_payroll_recipients') || '[]');
        this.schedules = JSON.parse(localStorage.getItem('obelisk_payroll_schedules') || '[]');
        this.payments = JSON.parse(localStorage.getItem('obelisk_payroll_payments') || '[]');
    },

    save() {
        localStorage.setItem('obelisk_payroll_companies', JSON.stringify(this.companies));
        localStorage.setItem('obelisk_payroll_recipients', JSON.stringify(this.recipients));
        localStorage.setItem('obelisk_payroll_schedules', JSON.stringify(this.schedules));
        localStorage.setItem('obelisk_payroll_payments', JSON.stringify(this.payments));
    },

    // Create/Update company profile
    createCompany(data) {
        const company = {
            id: 'company-' + Date.now(),
            name: data.name,
            email: data.email || '',
            wallet: data.wallet || '',
            defaultCurrency: data.defaultCurrency || 'USDC',
            taxId: data.taxId || '',
            country: data.country || '',
            createdAt: Date.now()
        };

        this.companies.push(company);
        this.save();

        return { success: true, company };
    },

    // Add recipient (employee or business)
    addRecipient(companyId, data) {
        const recipient = {
            id: 'recipient-' + Date.now(),
            companyId,
            name: data.name,
            email: data.email || '',
            wallet: data.wallet,
            salary: data.salary,
            currency: data.currency || 'USDC',
            paymentCurrency: data.paymentCurrency || 'USDC', // Can convert
            type: data.type || 'b2c', // b2b or b2c
            frequency: data.frequency || 'monthly', // daily, weekly, biweekly, monthly
            startDate: data.startDate || Date.now(),
            isActive: true,
            createdAt: Date.now()
        };

        this.recipients.push(recipient);
        this.save();

        const typeIcon = this.recipientTypes[recipient.type]?.icon || '👤';
        const freqName = this.frequencies[recipient.frequency]?.name || 'Monthly';

        if (typeof showNotification === 'function') {
            showNotification(`${typeIcon} Added ${data.name} (${freqName})`, 'success');
        }

        return { success: true, recipient };
    },

    // Create payment schedule
    createSchedule(companyId, options = {}) {
        const company = this.companies.find(c => c.id === companyId);
        if (!company) return { success: false, error: 'Company not found' };

        const companyRecipients = this.recipients.filter(r => r.companyId === companyId && r.isActive);
        if (companyRecipients.length === 0) {
            return { success: false, error: 'No active recipients' };
        }

        const totalAmount = companyRecipients.reduce((sum, r) => sum + r.salary, 0);

        const schedule = {
            id: 'schedule-' + Date.now(),
            companyId,
            companyName: company.name,
            frequency: options.frequency || 'monthly',
            payDay: options.payDay || 25, // Day of month
            recipientCount: companyRecipients.length,
            totalAmount,
            currency: company.defaultCurrency,
            nextPayment: this.calculateNextPayment(options.frequency || 'monthly', options.payDay || 25),
            isActive: true,
            createdAt: Date.now()
        };

        this.schedules.push(schedule);
        this.save();

        if (typeof showNotification === 'function') {
            showNotification(`📅 Payroll schedule created: ${schedule.frequency} on day ${schedule.payDay}`, 'success');
        }

        return { success: true, schedule };
    },

    calculateNextPayment(frequency, payDay) {
        const now = new Date();
        let next = new Date();

        if (frequency === 'daily') {
            // Next day at same time
            next.setDate(now.getDate() + 1);
        } else if (frequency === 'weekly') {
            const daysUntil = (payDay - now.getDay() + 7) % 7 || 7;
            next.setDate(now.getDate() + daysUntil);
        } else if (frequency === 'biweekly') {
            const daysUntil = (payDay - now.getDay() + 7) % 7 || 7;
            next.setDate(now.getDate() + daysUntil + 7);
        } else if (frequency === 'monthly') {
            next.setDate(payDay);
            if (now.getDate() >= payDay) {
                next.setMonth(next.getMonth() + 1);
            }
        }

        return next.getTime();
    },

    // Start payment scheduler
    startPaymentScheduler() {
        setInterval(() => {
            const now = Date.now();

            this.schedules.filter(s => s.isActive && s.nextPayment <= now).forEach(schedule => {
                this.executePayroll(schedule.id);
            });
        }, 60000); // Check every minute
    },

    // Execute payroll for a schedule
    async executePayroll(scheduleId) {
        const schedule = this.schedules.find(s => s.id === scheduleId);
        if (!schedule) return { success: false, error: 'Schedule not found' };

        const recipients = this.recipients.filter(r => r.companyId === schedule.companyId && r.isActive);

        const payrollRun = {
            id: 'payroll-' + Date.now(),
            scheduleId,
            companyId: schedule.companyId,
            timestamp: Date.now(),
            totalAmount: 0,
            recipientCount: recipients.length,
            payments: [],
            status: 'processing'
        };

        // Process each recipient
        for (const recipient of recipients) {
            const payment = await this.processPayment(recipient, schedule);
            payrollRun.payments.push(payment);
            payrollRun.totalAmount += payment.amount;
        }

        payrollRun.status = 'completed';

        this.payments.push(payrollRun);

        // Update next payment date
        schedule.nextPayment = this.calculateNextPayment(
            schedule.frequency,
            schedule.payDay
        );

        this.save();

        if (typeof showNotification === 'function') {
            showNotification(
                `✅ Payroll executed: ${recipients.length} payments, $${payrollRun.totalAmount.toFixed(2)} total`,
                'success'
            );
        }

        return { success: true, payrollRun };
    },

    // Process individual payment
    async processPayment(recipient, schedule) {
        let amount = recipient.salary;
        let currency = recipient.paymentCurrency;

        // Convert if needed
        if (recipient.currency !== recipient.paymentCurrency) {
            amount = this.convert(recipient.salary, recipient.currency, recipient.paymentCurrency);
        }

        const payment = {
            recipientId: recipient.id,
            recipientName: recipient.name,
            recipientWallet: recipient.wallet,
            amount,
            currency,
            originalAmount: recipient.salary,
            originalCurrency: recipient.currency,
            txHash: 'sim-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            status: 'completed',
            timestamp: Date.now()
        };

        return payment;
    },

    // Convert between currencies
    convert(amount, from, to) {
        // Mock conversion rates
        const rates = {
            USDC: 1, USDT: 1, USD: 1,
            EUR: 1.08,
            ETH: 1/2650,
            BTC: 1/97000
        };

        const usdAmount = amount / (rates[from] || 1);
        return usdAmount * (rates[to] || 1);
    },

    // Generate tax report
    generateTaxReport(companyId, year) {
        const companyPayments = this.payments.filter(p =>
            p.companyId === companyId &&
            new Date(p.timestamp).getFullYear() === year
        );

        const report = {
            companyId,
            year,
            generatedAt: Date.now(),
            totalPayments: companyPayments.length,
            totalAmount: 0,
            byRecipient: {},
            byMonth: {}
        };

        companyPayments.forEach(payroll => {
            payroll.payments.forEach(payment => {
                // By recipient
                if (!report.byRecipient[payment.recipientId]) {
                    report.byRecipient[payment.recipientId] = {
                        name: payment.recipientName,
                        wallet: payment.recipientWallet,
                        totalPaid: 0,
                        paymentCount: 0
                    };
                }
                report.byRecipient[payment.recipientId].totalPaid += payment.amount;
                report.byRecipient[payment.recipientId].paymentCount++;

                // By month
                const month = new Date(payment.timestamp).getMonth();
                if (!report.byMonth[month]) {
                    report.byMonth[month] = 0;
                }
                report.byMonth[month] += payment.amount;

                report.totalAmount += payment.amount;
            });
        });

        return report;
    },

    getStats() {
        const activeRecipients = this.recipients.filter(r => r.isActive).length;
        const activeSchedules = this.schedules.filter(s => s.isActive).length;
        const totalPaid = this.payments.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalPayments = this.payments.length;

        const upcomingPayments = this.schedules
            .filter(s => s.isActive)
            .sort((a, b) => a.nextPayment - b.nextPayment)
            .slice(0, 5);

        return {
            companies: this.companies.length,
            activeRecipients,
            activeSchedules,
            totalPaid,
            totalPayments,
            upcomingPayments
        };
    },

    render(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const stats = this.getStats();
        const hasCompany = this.companies.length > 0;

        el.innerHTML = `
            <div style="padding:20px;">
                <h2 style="color:#00ff88;margin-bottom:8px;">💼 Crypto Payroll B2B/B2C</h2>
                <p style="color:#888;margin-bottom:20px;">Manage recurring crypto payments • Daily, Weekly, or Monthly • Businesses & Individuals</p>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Total Paid</div>
                        <div style="color:#00ff88;font-size:20px;font-weight:bold;">$${stats.totalPaid.toFixed(0)}</div>
                    </div>
                    <div style="background:rgba(0,170,255,0.1);border:1px solid rgba(0,170,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Recipients</div>
                        <div style="color:#00aaff;font-size:20px;font-weight:bold;">${stats.activeRecipients}</div>
                    </div>
                    <div style="background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Schedules</div>
                        <div style="color:#ffaa00;font-size:20px;font-weight:bold;">${stats.activeSchedules}</div>
                    </div>
                    <div style="background:rgba(136,0,255,0.1);border:1px solid rgba(136,0,255,0.3);border-radius:12px;padding:16px;text-align:center;">
                        <div style="color:#888;font-size:11px;">Payrolls Run</div>
                        <div style="color:#8800ff;font-size:20px;font-weight:bold;">${stats.totalPayments}</div>
                    </div>
                </div>

                ${!hasCompany ? `
                    <!-- Create Company -->
                    <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,136,0.3);border-radius:12px;padding:24px;margin-bottom:24px;">
                        <h3 style="color:#00ff88;margin-bottom:16px;">🏢 Create Your Company</h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                            <div>
                                <label style="color:#888;font-size:12px;">Company Name</label>
                                <input type="text" id="payroll-company-name" placeholder="Acme Inc."
                                       style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Treasury Wallet</label>
                                <input type="text" id="payroll-company-wallet" placeholder="0x..."
                                       style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Default Currency</label>
                                <select id="payroll-company-currency" style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;">
                                    <option value="USDC">USDC</option>
                                    <option value="USDT">USDT</option>
                                    <option value="ETH">ETH</option>
                                </select>
                            </div>
                            <div style="display:flex;align-items:end;">
                                <button onclick="CryptoPayroll.createCompanyFromUI()"
                                        style="width:100%;padding:12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;">
                                    Create Company
                                </button>
                            </div>
                        </div>
                    </div>
                ` : `
                    <!-- Add Recipient -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                        <h3 style="color:#fff;margin-bottom:16px;">➕ Add Recipient (B2B / B2C)</h3>
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;align-items:end;">
                            <div>
                                <label style="color:#888;font-size:12px;">Type</label>
                                <select id="payroll-recipient-type" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;font-size:13px;">
                                    <option value="b2c">👤 B2C (Individual)</option>
                                    <option value="b2b">🏢 B2B (Business)</option>
                                </select>
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Name</label>
                                <input type="text" id="payroll-recipient-name" placeholder="John Doe / Acme Inc."
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;font-size:13px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Wallet</label>
                                <input type="text" id="payroll-recipient-wallet" placeholder="0x..."
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;font-size:13px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Amount</label>
                                <input type="number" id="payroll-recipient-salary" placeholder="5000"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;font-size:13px;">
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;align-items:end;margin-top:12px;">
                            <div>
                                <label style="color:#888;font-size:12px;">Frequency</label>
                                <select id="payroll-recipient-frequency" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;font-size:13px;">
                                    <option value="daily">📅 Daily (1/J)</option>
                                    <option value="weekly">📆 Weekly (1/sem)</option>
                                    <option value="biweekly">🗓️ Bi-weekly</option>
                                    <option value="monthly" selected>📋 Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Start Date</label>
                                <input type="date" id="payroll-recipient-startdate"
                                       style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;font-size:13px;">
                            </div>
                            <div>
                                <label style="color:#888;font-size:12px;">Currency</label>
                                <select id="payroll-recipient-currency" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;margin-top:4px;font-size:13px;">
                                    <option value="USDC">💵 USDC</option>
                                    <option value="USDT">💲 USDT</option>
                                    <option value="ETH">Ξ ETH</option>
                                    <option value="BTC">₿ BTC</option>
                                </select>
                            </div>
                        </div>
                        <button onclick="CryptoPayroll.addRecipientFromUI()"
                                style="width:100%;padding:12px;margin-top:12px;background:linear-gradient(135deg,#00ff88,#00cc66);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">
                            ➕ Add Recipient
                        </button>
                    </div>

                    <!-- Recipients List -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <h3 style="color:#fff;margin:0;">📋 Recipients (${this.recipients.length})</h3>
                            ${this.recipients.length > 0 ? `
                                <button onclick="CryptoPayroll.runPayrollNow()"
                                        style="padding:8px 16px;background:rgba(0,255,136,0.2);border:1px solid rgba(0,255,136,0.4);border-radius:6px;color:#00ff88;cursor:pointer;font-size:12px;">
                                    ▶ Run Payroll Now
                                </button>
                            ` : ''}
                        </div>
                        ${this.recipients.length === 0 ? `
                            <div style="text-align:center;padding:40px;color:#888;">
                                No recipients yet. Add employees above to start managing payroll.
                            </div>
                        ` : `
                            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                                <thead>
                                    <tr style="color:#888;border-bottom:1px solid rgba(255,255,255,0.1);">
                                        <th style="text-align:center;padding:8px;">Type</th>
                                        <th style="text-align:left;padding:8px;">Name</th>
                                        <th style="text-align:left;padding:8px;">Wallet</th>
                                        <th style="text-align:right;padding:8px;">Amount</th>
                                        <th style="text-align:center;padding:8px;">Frequency</th>
                                        <th style="text-align:center;padding:8px;">Start</th>
                                        <th style="text-align:center;padding:8px;">Currency</th>
                                        <th style="text-align:center;padding:8px;">X</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.recipients.map(r => `
                                        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                            <td style="padding:10px;text-align:center;">
                                                <span style="padding:2px 6px;background:${r.type === 'b2b' ? 'rgba(0,170,255,0.2)' : 'rgba(0,255,136,0.2)'};border-radius:4px;font-size:10px;color:${r.type === 'b2b' ? '#00aaff' : '#00ff88'};">
                                                    ${r.type === 'b2b' ? '🏢' : '👤'}
                                                </span>
                                            </td>
                                            <td style="padding:10px;color:#fff;font-weight:500;">${r.name}</td>
                                            <td style="padding:10px;color:#888;font-family:monospace;font-size:10px;">${r.wallet.slice(0, 6)}...${r.wallet.slice(-4)}</td>
                                            <td style="padding:10px;text-align:right;color:#00ff88;font-weight:bold;">$${r.salary.toLocaleString()}</td>
                                            <td style="padding:10px;text-align:center;">
                                                <span style="padding:2px 6px;background:rgba(255,170,0,0.2);border-radius:4px;font-size:10px;color:#ffaa00;">
                                                    ${this.frequencies[r.frequency]?.icon || '📋'} ${this.frequencies[r.frequency]?.name || 'Monthly'}
                                                </span>
                                            </td>
                                            <td style="padding:10px;text-align:center;color:#888;font-size:11px;">
                                                ${new Date(r.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                            </td>
                                            <td style="padding:10px;text-align:center;font-size:11px;">${this.currencies[r.paymentCurrency]?.icon || ''} ${r.paymentCurrency}</td>
                                            <td style="padding:10px;text-align:center;">
                                                <button onclick="CryptoPayroll.removeRecipient('${r.id}')"
                                                        style="padding:3px 6px;background:rgba(255,68,68,0.2);border:1px solid rgba(255,68,68,0.4);border-radius:4px;color:#ff4444;cursor:pointer;font-size:10px;">
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr style="border-top:2px solid rgba(0,255,136,0.3);">
                                        <td colspan="3" style="padding:10px;color:#888;font-weight:bold;">
                                            Total: ${this.recipients.filter(r => r.type === 'b2b').length} B2B / ${this.recipients.filter(r => r.type === 'b2c').length} B2C
                                        </td>
                                        <td style="padding:10px;text-align:right;color:#00ff88;font-size:16px;font-weight:bold;">
                                            $${this.recipients.reduce((sum, r) => sum + r.salary, 0).toLocaleString()}
                                        </td>
                                        <td colspan="4" style="padding:10px;color:#888;font-size:11px;">
                                            /period
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        `}
                    </div>

                    <!-- Payment History -->
                    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:20px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <h3 style="color:#fff;margin:0;">📜 Payment History</h3>
                            ${this.payments.length > 0 ? `
                                <button onclick="CryptoPayroll.downloadReport()"
                                        style="padding:8px 16px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#888;cursor:pointer;font-size:12px;">
                                    📥 Download Report
                                </button>
                            ` : ''}
                        </div>
                        ${this.payments.length === 0 ? `
                            <div style="text-align:center;padding:40px;color:#888;">
                                No payments yet. Run your first payroll to see history here.
                            </div>
                        ` : `
                            <div style="max-height:300px;overflow-y:auto;">
                                ${this.payments.slice().reverse().map(p => `
                                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid rgba(255,255,255,0.05);">
                                        <div>
                                            <div style="color:#fff;font-weight:500;">${new Date(p.timestamp).toLocaleDateString()}</div>
                                            <div style="color:#888;font-size:12px;">${p.recipientCount} recipients</div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="color:#00ff88;font-weight:bold;">$${p.totalAmount.toFixed(2)}</div>
                                            <div style="color:#666;font-size:11px;">${p.status}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                `}
            </div>
        `;
    },

    createCompanyFromUI() {
        const name = document.getElementById('payroll-company-name')?.value;
        const wallet = document.getElementById('payroll-company-wallet')?.value;
        const currency = document.getElementById('payroll-company-currency')?.value;

        if (!name) {
            if (typeof showNotification === 'function') showNotification('Please enter company name', 'error');
            return;
        }

        this.createCompany({ name, wallet, defaultCurrency: currency });
        this.render('crypto-payroll-container');

        if (typeof showNotification === 'function') {
            showNotification(`🏢 Company "${name}" created!`, 'success');
        }
    },

    addRecipientFromUI() {
        const type = document.getElementById('payroll-recipient-type')?.value || 'b2c';
        const name = document.getElementById('payroll-recipient-name')?.value;
        const wallet = document.getElementById('payroll-recipient-wallet')?.value;
        const salary = parseFloat(document.getElementById('payroll-recipient-salary')?.value || 0);
        const frequency = document.getElementById('payroll-recipient-frequency')?.value || 'monthly';
        const startDateStr = document.getElementById('payroll-recipient-startdate')?.value;
        const currency = document.getElementById('payroll-recipient-currency')?.value;

        if (!name || !wallet || salary <= 0) {
            if (typeof showNotification === 'function') showNotification('Please fill all fields', 'error');
            return;
        }

        const companyId = this.companies[0]?.id;
        if (!companyId) {
            if (typeof showNotification === 'function') showNotification('Create a company first', 'error');
            return;
        }

        // Parse start date or use today
        const startDate = startDateStr ? new Date(startDateStr).getTime() : Date.now();

        this.addRecipient(companyId, { name, wallet, salary, type, frequency, startDate, paymentCurrency: currency });

        // Clear inputs
        document.getElementById('payroll-recipient-name').value = '';
        document.getElementById('payroll-recipient-wallet').value = '';
        document.getElementById('payroll-recipient-salary').value = '';
        document.getElementById('payroll-recipient-startdate').value = '';

        this.render('crypto-payroll-container');
    },

    removeRecipient(recipientId) {
        this.recipients = this.recipients.filter(r => r.id !== recipientId);
        this.save();
        this.render('crypto-payroll-container');
        if (typeof showNotification === 'function') showNotification('Recipient removed', 'info');
    },

    runPayrollNow() {
        const schedule = this.schedules[0] || this.createSchedule(this.companies[0]?.id, { frequency: 'monthly', payDay: new Date().getDate() }).schedule;
        if (schedule) {
            this.executePayroll(schedule.id);
            setTimeout(() => this.render('crypto-payroll-container'), 500);
        }
    },

    downloadReport() {
        const report = this.generateTaxReport(this.companies[0]?.id, new Date().getFullYear());
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll-report-${report.year}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => CryptoPayroll.init());
window.CryptoPayroll = CryptoPayroll;
console.log('[CryptoPayroll] Module loaded');
