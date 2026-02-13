/* ============================================
   AI ADVISOR CHAT - Shared Module
   Conversational AI advisor for crypto/DeFi guidance
   ============================================ */

const AIAdvisorChat = {
    messages: [],
    isThinking: false,

    RESPONSES: {
        portfolio: [
            "Based on current market conditions, a balanced portfolio might include 40% BTC, 25% ETH, 15% stablecoins, and 20% altcoins. Consider your risk tolerance before allocating.",
            "Diversification is key. I'd recommend not putting more than 30% in any single asset. Also consider staking idle assets for passive yield."
        ],
        bitcoin: [
            "Bitcoin is currently trading near all-time highs. Dollar-cost averaging (DCA) is often the safest entry strategy at these levels.",
            "BTC dominance tends to cycle. During high dominance phases, BTC outperforms alts. Monitor the BTC.D chart for rotation signals."
        ],
        staking: [
            "ETH staking currently offers ~4% APY. It's one of the safest yield options in DeFi. You can stake through Obelisk's staking module.",
            "When staking, consider the lock-up period and the protocol's track record. Liquid staking derivatives (stETH, rETH) offer flexibility."
        ],
        risk: [
            "A good rule of thumb: never risk more than 2% of your portfolio on a single trade. Use stop-losses and take-profits consistently.",
            "Risk management is more important than entry timing. Position sizing, stop-losses, and portfolio correlation are the three pillars."
        ],
        defi: [
            "DeFi yield comes with smart contract risk. Stick to audited protocols with proven track records. Obelisk's products are a good starting point.",
            "Impermanent loss is the main risk in liquidity provision. It's most significant when paired assets diverge significantly in price."
        ],
        default: [
            "That's a great question! In the crypto space, I'd recommend always doing thorough research and never investing more than you can afford to lose.",
            "Interesting topic! I can help with portfolio strategy, risk management, DeFi concepts, or specific asset analysis. What would you like to explore?",
            "Let me think about that... In general, the key principles are: diversify, manage risk, and think long-term. How can I help you apply these?"
        ]
    },

    init() {
        this.messages = [];
    },

    getResponse(input) {
        var lower = input.toLowerCase();
        var key = 'default';
        if (lower.includes('portfolio') || lower.includes('allocat') || lower.includes('diversif')) key = 'portfolio';
        else if (lower.includes('bitcoin') || lower.includes('btc')) key = 'bitcoin';
        else if (lower.includes('stak') || lower.includes('yield') || lower.includes('apy')) key = 'staking';
        else if (lower.includes('risk') || lower.includes('stop') || lower.includes('loss')) key = 'risk';
        else if (lower.includes('defi') || lower.includes('liquidity') || lower.includes('pool') || lower.includes('farm')) key = 'defi';

        var responses = this.RESPONSES[key];
        return responses[Math.floor(Math.random() * responses.length)];
    },

    addMessage(role, text) {
        this.messages.push({ role: role, text: text, time: new Date() });
    },

    render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;

        var html = '<div class="sol-chat-container">' +
            '<div class="sol-chat-messages" id="chat-messages">';

        if (this.messages.length === 0) {
            html += '<div style="text-align:center;padding:40px;color:#555">' +
                '<div style="font-size:48px;margin-bottom:12px">🤖</div>' +
                '<div style="font-size:16px;color:#aaa;margin-bottom:8px">Obelisk AI Advisor</div>' +
                '<div style="font-size:13px">Ask me anything about crypto, DeFi, portfolio strategy, or risk management.</div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:16px">' +
                '<button class="sol-btn sol-btn-sm sol-btn-outline chat-suggestion">How should I allocate my portfolio?</button>' +
                '<button class="sol-btn sol-btn-sm sol-btn-outline chat-suggestion">Is it a good time to buy BTC?</button>' +
                '<button class="sol-btn sol-btn-sm sol-btn-outline chat-suggestion">Explain DeFi yield farming</button>' +
                '<button class="sol-btn sol-btn-sm sol-btn-outline chat-suggestion">How to manage risk?</button>' +
                '</div></div>';
        } else {
            this.messages.forEach(function(msg) {
                html += '<div class="sol-chat-msg ' + msg.role + '">' +
                    '<div class="sol-chat-bubble">' + msg.text + '</div></div>';
            });
            if (this.isThinking) {
                html += '<div class="sol-chat-msg ai"><div class="sol-chat-bubble" style="color:#555">Thinking...</div></div>';
            }
        }

        html += '</div>' +
            '<div class="sol-chat-input-row">' +
            '<input class="sol-input" id="chat-input" placeholder="Ask me anything..." style="border-radius:20px">' +
            '<button class="sol-btn sol-btn-primary" id="chat-send" style="border-radius:20px;padding:8px 20px">Send</button>' +
            '</div></div>';

        c.innerHTML = html;
        this.bindEvents(c);
        this.scrollToBottom();
    },

    scrollToBottom() {
        var msgs = document.getElementById('chat-messages');
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
    },

    sendMessage(text) {
        if (!text.trim()) return;
        this.addMessage('user', text);
        this.isThinking = true;
        this.render('solution-body');

        var self = this;
        setTimeout(function() {
            var response = self.getResponse(text);
            self.addMessage('ai', response);
            self.isThinking = false;
            self.render('solution-body');
        }, 800 + Math.random() * 1200);
    },

    bindEvents(container) {
        var self = this;

        var input = container.querySelector('#chat-input');
        var sendBtn = container.querySelector('#chat-send');

        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                if (input) { self.sendMessage(input.value); input.value = ''; }
            });
        }
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') { self.sendMessage(input.value); input.value = ''; }
            });
            setTimeout(function() { input.focus(); }, 100);
        }

        container.querySelectorAll('.chat-suggestion').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.sendMessage(this.textContent);
            });
        });
    }
};

SolutionsHub.registerSolution('ai-advisor', AIAdvisorChat, 'shared', {
    icon: '🤖', name: 'AI Advisor', description: 'Conversational AI assistant for crypto strategy and DeFi guidance'
});
