const GovernanceUI = {
    containerId: null,

    init(containerId = 'governance-section') {
        this.containerId = containerId;
        this.render();
    },

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.warn('[GovernanceUI] Container not found:', this.containerId);
            return;
        }

        container.innerHTML = this.buildHTML();
        this.attachEvents();
    },

    buildHTML() {
        const votingPower = Governance.getVotingPower();
        const activeProposals = Governance.getActiveProposals();
        const completedProposals = Governance.getCompletedProposals();

        return `
            <div class="governance-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div class="governance-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <div>
                        <h1 style="color: #00ff88; font-size: 32px; margin: 0 0 10px 0;">Governance</h1>
                        <p style="color: #8b949e; margin: 0;">Shape the future of Obelisk through community voting</p>
                    </div>
                    <button id="new-proposal-btn" class="btn-primary" style="background: linear-gradient(135deg, #00ff88, #00cc6a); color: #0d1117; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                        + New Proposal
                    </button>
                </div>

                <!-- Voting Power Display -->
                <div class="voting-power-card" style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #00ff88, #00cc6a); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                            ⚡
                        </div>
                        <div>
                            <div style="color: #8b949e; font-size: 14px; margin-bottom: 5px;">Your Voting Power</div>
                            <div style="color: #00ff88; font-size: 28px; font-weight: 600;">${votingPower.toLocaleString()} OBL</div>
                        </div>
                    </div>
                </div>

                <!-- Active Proposals Section -->
                <div class="proposals-section" style="margin-bottom: 40px;">
                    <h2 style="color: #c9d1d9; font-size: 24px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <span style="width: 12px; height: 12px; background: #00ff88; border-radius: 50%; display: inline-block; animation: pulse 2s infinite;"></span>
                        Active Proposals (${activeProposals.length})
                    </h2>
                    <div class="proposals-grid" style="display: grid; gap: 20px;">
                        ${activeProposals.length > 0 ? activeProposals.map(p => this.renderProposalCard(p)).join('') : '<div style="color: #8b949e; text-align: center; padding: 40px;">No active proposals</div>'}
                    </div>
                </div>

                <!-- Completed Proposals Section -->
                <div class="proposals-section">
                    <h2 style="color: #c9d1d9; font-size: 24px; margin-bottom: 20px;">
                        Completed Proposals (${completedProposals.length})
                    </h2>
                    <div class="proposals-grid" style="display: grid; gap: 20px;">
                        ${completedProposals.length > 0 ? completedProposals.slice(0, 5).map(p => this.renderProposalCard(p)).join('') : '<div style="color: #8b949e; text-align: center; padding: 40px;">No completed proposals</div>'}
                    </div>
                </div>
            </div>

            <!-- New Proposal Modal (hidden by default) -->
            <div id="new-proposal-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 500; align-items: center; justify-content: center;">
                <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%;">
                    <h2 style="color: #00ff88; margin: 0 0 20px 0;">Create New Proposal</h2>

                    <div style="margin-bottom: 20px;">
                        <label style="color: #c9d1d9; display: block; margin-bottom: 8px; font-weight: 500;">Title</label>
                        <input id="proposal-title" type="text" placeholder="e.g., Reduce trading fees to 0.1%" style="width: 100%; padding: 12px; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; color: #c9d1d9; font-size: 14px;" />
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="color: #c9d1d9; display: block; margin-bottom: 8px; font-weight: 500;">Description</label>
                        <textarea id="proposal-description" placeholder="Explain your proposal in detail..." rows="5" style="width: 100%; padding: 12px; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; color: #c9d1d9; font-size: 14px; resize: vertical;"></textarea>
                    </div>

                    <div style="color: #8b949e; font-size: 13px; margin-bottom: 20px; padding: 12px; background: #0d1117; border-radius: 8px; border-left: 3px solid #00ff88;">
                        <strong>Note:</strong> Minimum 1000 OBL required to create proposals. Voting period: 7 days.
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button id="submit-proposal-btn" style="flex: 1; background: linear-gradient(135deg, #00ff88, #00cc6a); color: #0d1117; padding: 12px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Create Proposal
                        </button>
                        <button id="cancel-proposal-btn" style="flex: 1; background: #21262d; color: #c9d1d9; padding: 12px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3); }
                .vote-btn:hover { background: #238636 !important; }
                .vote-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            </style>
        `;
    },

    renderProposalCard(proposal) {
        const percentages = Governance.getVotePercentages(proposal);
        const hasVoted = Governance.hasVoted(proposal.id);
        const userVote = Governance.getUserVote(proposal.id);
        const timeLeft = this.formatTimeLeft(proposal.endsAt);
        const isActive = proposal.status === 'active';

        // Status badge
        const statusColors = {
            active: '#00ff88',
            passed: '#58a6ff',
            rejected: '#f85149',
            expired: '#8b949e'
        };
        const statusColor = statusColors[proposal.status] || '#8b949e';

        return `
            <div class="proposal-card" style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; transition: all 0.3s;" onmouseover="this.style.borderColor='#00ff88'" onmouseout="this.style.borderColor='#30363d'">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <h3 style="color: #c9d1d9; font-size: 18px; margin: 0 0 8px 0;">${this.escapeHtml(proposal.title)}</h3>
                        <p style="color: #8b949e; font-size: 14px; margin: 0; line-height: 1.5;">${this.escapeHtml(proposal.description)}</p>
                    </div>
                    <span style="background: ${statusColor}22; color: ${statusColor}; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; white-space: nowrap; margin-left: 15px;">
                        ${proposal.status}
                    </span>
                </div>

                <!-- Voting Options & Progress Bars -->
                <div style="margin-bottom: 20px;">
                    ${proposal.options.map((option, idx) => {
                        const percentage = percentages[idx] || 0;
                        const votes = proposal.votes[idx] || 0;
                        const isUserChoice = hasVoted && userVote === idx;

                        return `
                            <div style="margin-bottom: 12px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="color: #c9d1d9; font-size: 14px; font-weight: 500;">
                                        ${this.escapeHtml(option)}
                                        ${isUserChoice ? '<span style="color: #00ff88;">✓</span>' : ''}
                                    </span>
                                    <span style="color: #8b949e; font-size: 14px;">
                                        ${votes.toLocaleString()} votes (${percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <div style="background: #0d1117; height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: linear-gradient(90deg, #00ff88, #00cc6a); height: 100%; width: ${percentage}%; transition: width 0.5s;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Footer: Time & Vote Buttons -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #30363d;">
                    <div style="color: #8b949e; font-size: 13px;">
                        <span style="margin-right: 15px;">⏱ ${timeLeft}</span>
                        <span>📊 ${proposal.totalVotes.toLocaleString()} total votes</span>
                    </div>

                    ${isActive && !hasVoted ? `
                        <div style="display: flex; gap: 8px;">
                            ${proposal.options.map((option, idx) => `
                                <button class="vote-btn" data-proposal-id="${proposal.id}" data-option-index="${idx}" style="background: #238636; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                                    Vote ${this.escapeHtml(option)}
                                </button>
                            `).join('')}
                        </div>
                    ` : hasVoted ? `
                        <div style="color: #00ff88; font-size: 13px; font-weight: 500;">
                            ✓ You voted for ${this.escapeHtml(proposal.options[userVote])}
                        </div>
                    ` : `
                        <div style="color: #8b949e; font-size: 13px;">
                            Voting ended
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    showNewProposalModal() {
        const modal = document.getElementById('new-proposal-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    hideNewProposalModal() {
        const modal = document.getElementById('new-proposal-modal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('proposal-title').value = '';
            document.getElementById('proposal-description').value = '';
        }
    },

    async submitProposal() {
        const title = document.getElementById('proposal-title').value.trim();
        const description = document.getElementById('proposal-description').value.trim();

        if (!title || !description) {
            alert('Please fill in all fields');
            return;
        }

        // Check minimum OBL requirement
        const votingPower = Governance.getVotingPower();
        if (votingPower < 1000) {
            alert(`Minimum 1000 OBL required to create proposals. You have ${votingPower} OBL.`);
            return;
        }

        try {
            const proposal = await Governance.createProposal(title, description);
            console.log('[GovernanceUI] Proposal created:', proposal);
            this.hideNewProposalModal();
            this.render(); // Refresh
            alert('Proposal created successfully!');
        } catch(e) {
            console.error('[GovernanceUI] Error creating proposal:', e);
            alert('Error creating proposal. Please try again.');
        }
    },

    attachEvents() {
        // New proposal button
        const newProposalBtn = document.getElementById('new-proposal-btn');
        if (newProposalBtn) {
            newProposalBtn.addEventListener('click', () => this.showNewProposalModal());
        }

        // Modal buttons
        const submitBtn = document.getElementById('submit-proposal-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitProposal());
        }

        const cancelBtn = document.getElementById('cancel-proposal-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideNewProposalModal());
        }

        // Vote buttons
        const voteButtons = document.querySelectorAll('.vote-btn');
        voteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const proposalId = e.target.dataset.proposalId;
                const optionIndex = parseInt(e.target.dataset.optionIndex);

                if (confirm(`Cast your vote for this option?`)) {
                    try {
                        const result = await Governance.vote(proposalId, optionIndex);
                        if (result.error) {
                            alert(result.error);
                        } else {
                            console.log('[GovernanceUI] Vote cast successfully');
                            this.render(); // Refresh
                        }
                    } catch(err) {
                        console.error('[GovernanceUI] Vote error:', err);
                        alert('Error casting vote. Please try again.');
                    }
                }
            });
        });

        // Close modal on outside click
        const modal = document.getElementById('new-proposal-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideNewProposalModal();
                }
            });
        }
    },

    // Format time remaining
    formatTimeLeft(endsAt) {
        const diff = endsAt - Date.now();
        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.GovernanceUI = GovernanceUI;
