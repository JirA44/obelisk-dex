const express = require('express');
const router = express.Router();

// LI.FI / Socket aggregator proxy
const LIFI_API = 'https://li.quest/v1';

// Proxy quote requests (avoids CORS issues from frontend)
router.get('/cross-chain/quote', async (req, res) => {
    const { fromChain, toChain, fromToken, toToken, fromAmount, fromAddress } = req.query;

    if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const params = new URLSearchParams({ fromChain, toChain, fromToken, toToken, fromAmount, fromAddress: fromAddress || '0x0000000000000000000000000000000000000000' });
        const response = await fetch(`${LIFI_API}/quote?${params}`);
        const data = await response.json();
        res.json(data);
    } catch(e) {
        console.error('[CrossChain] Quote error:', e.message);
        res.status(500).json({ error: 'Failed to get quote' });
    }
});

// Get supported chains
router.get('/cross-chain/chains', (req, res) => {
    res.json({
        chains: [
            { id: 42161, name: 'Arbitrum', icon: '🔵' },
            { id: 10, name: 'Optimism', icon: '🔴' },
            { id: 8453, name: 'Base', icon: '🔷' },
            { id: 1, name: 'Ethereum', icon: '⟠' },
            { id: 137, name: 'Polygon', icon: '🟣' }
        ]
    });
});

// Check swap status
router.get('/cross-chain/status', async (req, res) => {
    const { txHash, fromChain, toChain } = req.query;
    if (!txHash) return res.status(400).json({ error: 'txHash required' });

    try {
        const response = await fetch(`${LIFI_API}/status?txHash=${txHash}&bridge=any&fromChain=${fromChain}&toChain=${toChain}`);
        const data = await response.json();
        res.json(data);
    } catch(e) {
        res.status(500).json({ error: 'Failed to check status' });
    }
});

// Transaction history (in-memory)
let txHistory = [];

router.post('/cross-chain/log', (req, res) => {
    const { txHash, fromChain, toChain, fromToken, toToken, amount, address } = req.body;
    txHistory.push({ txHash, fromChain, toChain, fromToken, toToken, amount, address, timestamp: Date.now() });
    if (txHistory.length > 500) txHistory = txHistory.slice(-500);
    res.json({ success: true });
});

router.get('/cross-chain/history', (req, res) => {
    const { address } = req.query;
    const filtered = address ? txHistory.filter(t => t.address === address) : txHistory.slice(-50);
    res.json(filtered);
});

module.exports = router;
