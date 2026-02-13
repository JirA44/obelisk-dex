// ═══════════════════════════════════════════════════════════════════════════════
// OBELISK DEX - RISK SCORING SYSTEM
// Score de risque /10 avec avertissements pour protéger les utilisateurs
// ═══════════════════════════════════════════════════════════════════════════════

const RiskScoring = {
    // Configuration des seuils
    config: {
        // Risque > 7 = Avertissement (pertes potentielles > gains sur long terme)
        warningThreshold: 7,
        // Risque > 8 = Déconseillé pour débutants
        dangerThreshold: 8,
        // Investissement passif max recommandé
        passiveMaxRisk: 5
    },

    // Calcule le score de risque (0-10) basé sur les paramètres du combo
    calculateRiskScore(combo) {
        let score = 0;

        // 1. Capital Protection (0-3 points)
        const protection = parseFloat(combo.capitalProtection) || 80;
        if (protection >= 95) score += 0;
        else if (protection >= 90) score += 0.5;
        else if (protection >= 80) score += 1;
        else if (protection >= 70) score += 2;
        else if (protection >= 50) score += 2.5;
        else score += 3;

        // 2. Risk Level Label (0-3 points)
        const riskLevel = (combo.riskLevel || 'Medium').toLowerCase();
        if (riskLevel === 'low') score += 0;
        else if (riskLevel === 'low-medium') score += 1;
        else if (riskLevel === 'medium') score += 1.5;
        else if (riskLevel === 'medium-high') score += 2;
        else if (riskLevel === 'high') score += 2.5;
        else if (riskLevel === 'very high') score += 3;

        // 3. Max APY (higher APY = higher risk) (0-2.5 points)
        const apyMax = parseFloat(combo.expectedApy?.split('-')[1]) || 10;
        if (apyMax <= 10) score += 0;
        else if (apyMax <= 20) score += 0.5;
        else if (apyMax <= 35) score += 1;
        else if (apyMax <= 50) score += 1.5;
        else if (apyMax <= 100) score += 2;
        else score += 2.5;

        // 4. Max Loss in allocation (0-1.5 points)
        const maxLosses = (combo.allocation || []).map(a => a.maxLoss || 0);
        const avgMaxLoss = maxLosses.length > 0 ? maxLosses.reduce((a, b) => a + b) / maxLosses.length : 10;
        if (avgMaxLoss <= 5) score += 0;
        else if (avgMaxLoss <= 15) score += 0.5;
        else if (avgMaxLoss <= 30) score += 1;
        else score += 1.5;

        // Round to 1 decimal
        return Math.min(10, Math.round(score * 10) / 10);
    },

    // Obtient le label de risque
    getRiskLabel(score) {
        if (score <= 2) return { label: 'Très Faible', labelEn: 'Very Low', color: '#00ff88', emoji: '🟢' };
        if (score <= 4) return { label: 'Faible', labelEn: 'Low', color: '#00d4aa', emoji: '🟢' };
        if (score <= 5) return { label: 'Modéré', labelEn: 'Moderate', color: '#00d4ff', emoji: '🔵' };
        if (score <= 7) return { label: 'Moyen', labelEn: 'Medium', color: '#ffaa00', emoji: '🟡' };
        if (score <= 8) return { label: 'Élevé', labelEn: 'High', color: '#ff8800', emoji: '🟠' };
        return { label: 'Très Élevé', labelEn: 'Very High', color: '#ff4444', emoji: '🔴' };
    },

    // Vérifie si le combo nécessite un avertissement
    needsWarning(score) {
        return score > this.config.warningThreshold;
    },

    // Vérifie si le combo est déconseillé pour débutants
    notForBeginners(score) {
        return score > this.config.dangerThreshold;
    },

    // Vérifie si le combo est bon pour le revenu passif
    isGoodForPassive(score) {
        return score <= this.config.passiveMaxRisk;
    },

    // Génère le message d'avertissement
    getWarningMessage(score, isFr = false) {
        if (score > 8) {
            return isFr
                ? '⚠️ ATTENTION: Risque très élevé. Pertes probables > Gains. Déconseillé pour investissement passif.'
                : '⚠️ WARNING: Very high risk. Losses likely > Gains. Not recommended for passive investing.';
        }
        if (score > 7) {
            return isFr
                ? '⚠️ Risque élevé. Investissez uniquement ce que vous pouvez perdre.'
                : '⚠️ High risk. Only invest what you can afford to lose.';
        }
        return null;
    },

    // Génère la recommandation
    getRecommendation(score, isFr = false) {
        if (score <= 3) {
            return {
                text: isFr ? '✅ Excellent pour revenu passif' : '✅ Excellent for passive income',
                color: '#00ff88'
            };
        }
        if (score <= 5) {
            return {
                text: isFr ? '✅ Bon pour investissement long terme' : '✅ Good for long-term investing',
                color: '#00d4aa'
            };
        }
        if (score <= 7) {
            return {
                text: isFr ? '⚖️ Équilibré risque/rendement' : '⚖️ Balanced risk/reward',
                color: '#ffaa00'
            };
        }
        if (score <= 8) {
            return {
                text: isFr ? '⚠️ Pour investisseurs expérimentés' : '⚠️ For experienced investors',
                color: '#ff8800'
            };
        }
        return {
            text: isFr ? '🚫 Déconseillé - Pertes > Gains' : '🚫 Not recommended - Losses > Gains',
            color: '#ff4444'
        };
    },

    // Calcule l'espérance mathématique (Expected Value)
    calculateExpectedValue(combo) {
        const protection = (parseFloat(combo.capitalProtection) || 80) / 100;
        const maxLoss = 1 - protection;
        const apyMin = parseFloat(combo.expectedApy?.split('-')[0]) || 5;
        const apyMax = parseFloat(combo.expectedApy?.split('-')[1]) || apyMin;
        const avgApy = (apyMin + apyMax) / 2;

        // Probabilités estimées
        const winProb = protection; // Simplifié: protection ≈ probabilité de gain
        const lossProb = 1 - winProb;

        // Expected Value = (prob_win × gain) - (prob_loss × loss)
        const expectedGain = winProb * (avgApy / 100);
        const expectedLoss = lossProb * maxLoss;
        const ev = expectedGain - expectedLoss;

        return {
            expectedValue: ev,
            evPercent: (ev * 100).toFixed(2),
            isPositive: ev > 0,
            recommendation: ev > 0.05 ? 'recommended' : ev > 0 ? 'neutral' : 'notRecommended'
        };
    },

    // Rend le badge de risque HTML
    renderRiskBadge(score, options = {}) {
        const { showScore = true, size = 'normal', isFr = false } = options;
        const riskInfo = this.getRiskLabel(score);
        const label = isFr ? riskInfo.label : riskInfo.labelEn;

        const sizeStyles = {
            small: 'font-size:11px;padding:3px 8px;',
            normal: 'font-size:12px;padding:4px 12px;',
            large: 'font-size:14px;padding:6px 16px;'
        };

        return `
            <div style="display:inline-flex;align-items:center;gap:6px;background:${riskInfo.color}20;border:1px solid ${riskInfo.color}50;border-radius:20px;${sizeStyles[size]}">
                <span>${riskInfo.emoji}</span>
                <span style="color:${riskInfo.color};font-weight:600;">${label}</span>
                ${showScore ? `<span style="color:${riskInfo.color};opacity:0.8;">${score}/10</span>` : ''}
            </div>
        `;
    },

    // Rend l'avertissement HTML si nécessaire
    renderWarning(score, options = {}) {
        const { isFr = false } = options;
        const warning = this.getWarningMessage(score, isFr);

        if (!warning) return '';

        const isVeryHigh = score > 8;
        const bgColor = isVeryHigh ? '#ff444420' : '#ff880020';
        const borderColor = isVeryHigh ? '#ff4444' : '#ff8800';

        return `
            <div style="background:${bgColor};border:1px solid ${borderColor};border-radius:10px;padding:12px;margin:10px 0;">
                <p style="color:${borderColor};margin:0;font-size:13px;line-height:1.5;">${warning}</p>
            </div>
        `;
    },

    // Rend le score de risque complet pour un combo
    renderRiskSection(combo, options = {}) {
        const { isFr = false, showDetails = true } = options;
        const score = this.calculateRiskScore(combo);
        const riskInfo = this.getRiskLabel(score);
        const recommendation = this.getRecommendation(score, isFr);
        const ev = this.calculateExpectedValue(combo);
        const isPassive = this.isGoodForPassive(score);

        return `
            <div style="background:#0a0a15;border-radius:12px;padding:16px;margin:10px 0;">
                <!-- Risk Score Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <span style="color:#888;font-size:12px;">${isFr ? 'Score de Risque' : 'Risk Score'}</span>
                    ${this.renderRiskBadge(score, { isFr })}
                </div>

                <!-- Risk Meter -->
                <div style="background:#1a1a2e;border-radius:8px;height:8px;overflow:hidden;margin-bottom:12px;">
                    <div style="background:linear-gradient(90deg, #00ff88, #ffaa00, #ff4444);height:100%;width:100%;position:relative;">
                        <div style="position:absolute;left:${score * 10}%;top:-4px;width:4px;height:16px;background:#fff;border-radius:2px;transform:translateX(-50%);box-shadow:0 0 6px rgba(255,255,255,0.5);"></div>
                    </div>
                </div>

                <!-- Labels -->
                <div style="display:flex;justify-content:space-between;font-size:10px;color:#666;margin-bottom:12px;">
                    <span>${isFr ? 'Sûr' : 'Safe'}</span>
                    <span>${isFr ? 'Modéré' : 'Moderate'}</span>
                    <span>${isFr ? 'Risqué' : 'Risky'}</span>
                </div>

                ${showDetails ? `
                    <!-- Recommendation -->
                    <div style="text-align:center;padding:10px;background:${recommendation.color}15;border-radius:8px;margin-bottom:10px;">
                        <span style="color:${recommendation.color};font-weight:600;font-size:13px;">${recommendation.text}</span>
                    </div>

                    <!-- Expected Value -->
                    <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;">
                        <span>${isFr ? 'Espérance' : 'Expected'}: ${ev.isPositive ? '+' : ''}${ev.evPercent}%</span>
                        ${isPassive ? `<span style="color:#00ff88;">✓ ${isFr ? 'Passif OK' : 'Passive OK'}</span>` : ''}
                    </div>
                ` : ''}

                <!-- Warning if needed -->
                ${this.renderWarning(score, { isFr })}
            </div>
        `;
    },

    // Enrichit un combo avec le score de risque
    enrichCombo(combo) {
        const score = this.calculateRiskScore(combo);
        const riskInfo = this.getRiskLabel(score);
        const ev = this.calculateExpectedValue(combo);

        return {
            ...combo,
            riskScore: score,
            riskLabel: riskInfo.label,
            riskLabelEn: riskInfo.labelEn,
            riskColor: riskInfo.color,
            riskEmoji: riskInfo.emoji,
            needsWarning: this.needsWarning(score),
            notForBeginners: this.notForBeginners(score),
            isGoodForPassive: this.isGoodForPassive(score),
            expectedValue: ev.evPercent,
            evPositive: ev.isPositive
        };
    },

    // Filtre les combos par score de risque max
    filterByMaxRisk(combos, maxScore) {
        return combos.filter(combo => this.calculateRiskScore(combo) <= maxScore);
    },

    // Trie les combos par risque (plus sûr en premier)
    sortBySafety(combos) {
        return [...combos].sort((a, b) => this.calculateRiskScore(a) - this.calculateRiskScore(b));
    },

    // Obtient les combos recommandés pour revenu passif
    getPassiveCombos(combos) {
        return this.filterByMaxRisk(combos, this.config.passiveMaxRisk);
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RiskScoring;
}
