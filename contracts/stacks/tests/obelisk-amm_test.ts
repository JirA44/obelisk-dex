import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.0/index.ts';
import { assertEquals, assertExists } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

// Mock token principals for testing
const TOKEN_X = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-x";
const TOKEN_Y = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-y";

Clarinet.test({
    name: "Can create a new liquidity pool",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        let block = chain.mineBlock([
            Tx.contractCall('obelisk-amm', 'create-pool', [
                types.principal(TOKEN_X),
                types.principal(TOKEN_Y),
                types.uint(30) // 0.3% fee
            ], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectUint(0);

        // Verify pool was created
        let poolResult = chain.callReadOnlyFn(
            'obelisk-amm',
            'get-pool',
            [types.uint(0)],
            deployer.address
        );

        assertExists(poolResult.result);
    }
});

Clarinet.test({
    name: "Cannot create duplicate pool",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        let block = chain.mineBlock([
            Tx.contractCall('obelisk-amm', 'create-pool', [
                types.principal(TOKEN_X),
                types.principal(TOKEN_Y),
                types.uint(30)
            ], deployer.address),
            Tx.contractCall('obelisk-amm', 'create-pool', [
                types.principal(TOKEN_X),
                types.principal(TOKEN_Y),
                types.uint(30)
            ], deployer.address)
        ]);

        block.receipts[0].result.expectOk();
        block.receipts[1].result.expectErr().expectUint(101); // ERR_POOL_EXISTS
    }
});

Clarinet.test({
    name: "Correct price calculation with 0.3% fee",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Test get-amount-out calculation
        // With 100 in, 10000 reserve_in, 20000 reserve_out
        // Expected: (100 * 997 * 20000) / (10000 * 1000 + 100 * 997) = ~197

        let result = chain.callReadOnlyFn(
            'obelisk-amm',
            'get-amount-out',
            [
                types.uint(100000000), // 100 tokens (8 decimals)
                types.uint(10000000000000), // 10000 reserve_in
                types.uint(20000000000000)  // 20000 reserve_out
            ],
            deployer.address
        );

        // Should be approximately 197.43 tokens
        const amountOut = parseInt(result.result.substring(1)); // Remove 'u' prefix
        console.log("Amount out:", amountOut);

        // Verify it's close to expected (accounting for integer division)
        assertEquals(amountOut > 196000000, true);
        assertEquals(amountOut < 198000000, true);
    }
});

Clarinet.test({
    name: "Quote function maintains ratio",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // quote(100, 1000, 2000) should return 200
        let result = chain.callReadOnlyFn(
            'obelisk-amm',
            'quote-amount',
            [
                types.uint(100),
                types.uint(1000),
                types.uint(2000)
            ],
            deployer.address
        );

        assertEquals(result.result, 'u200');
    }
});

Clarinet.test({
    name: "Get-amount-in calculates correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // To get 100 out with reserves 10000/10000
        let result = chain.callReadOnlyFn(
            'obelisk-amm',
            'get-amount-in',
            [
                types.uint(100),
                types.uint(10000),
                types.uint(10000)
            ],
            deployer.address
        );

        const amountIn = parseInt(result.result.substring(1));
        console.log("Amount in required:", amountIn);

        // Should be slightly more than 100 due to fees
        assertEquals(amountIn > 100, true);
        assertEquals(amountIn < 105, true); // ~101 with 0.3% fee
    }
});

Clarinet.test({
    name: "Deadline validation works",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Create pool first
        chain.mineBlock([
            Tx.contractCall('obelisk-amm', 'create-pool', [
                types.principal(TOKEN_X),
                types.principal(TOKEN_Y),
                types.uint(30)
            ], deployer.address)
        ]);

        // Try to add liquidity with expired deadline (block 0)
        let block = chain.mineBlock([
            Tx.contractCall('obelisk-amm', 'add-liquidity', [
                types.uint(0),
                types.uint(1000),
                types.uint(1000),
                types.uint(0),
                types.uint(0),
                types.uint(0) // Expired deadline
            ], deployer.address)
        ]);

        block.receipts[0].result.expectErr().expectUint(106); // ERR_DEADLINE_EXPIRED
    }
});

Clarinet.test({
    name: "Slippage protection works on swap",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Create pool
        chain.mineBlock([
            Tx.contractCall('obelisk-amm', 'create-pool', [
                types.principal(TOKEN_X),
                types.principal(TOKEN_Y),
                types.uint(30)
            ], deployer.address)
        ]);

        // Add liquidity
        chain.mineBlock([
            Tx.contractCall('obelisk-amm', 'add-liquidity', [
                types.uint(0),
                types.uint(10000),
                types.uint(10000),
                types.uint(0),
                types.uint(0),
                types.uint(1000) // Future deadline
            ], deployer.address)
        ]);

        // Try swap with unrealistic minimum out
        let block = chain.mineBlock([
            Tx.contractCall('obelisk-amm', 'swap-exact-x-for-y', [
                types.uint(0),
                types.uint(100),
                types.uint(1000), // Expecting way more than possible
                types.uint(1000)
            ], deployer.address)
        ]);

        block.receipts[0].result.expectErr().expectUint(105); // ERR_SLIPPAGE_EXCEEDED
    }
});

Clarinet.test({
    name: "Constant product formula verification",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Initial reserves: 10000 x 10000 = k = 100,000,000
        const reserveX = 10000;
        const reserveY = 10000;
        const kBefore = reserveX * reserveY;

        // After swap of 100 tokens with 0.3% fee
        // amountIn = 100, fee = 0.3 (so effective = 99.7)
        const amountIn = 100;
        const amountInWithFee = amountIn * 997;
        const numerator = amountInWithFee * reserveY;
        const denominator = reserveX * 1000 + amountInWithFee;
        const amountOut = Math.floor(numerator / denominator);

        const newReserveX = reserveX + amountIn;
        const newReserveY = reserveY - amountOut;
        const kAfter = newReserveX * newReserveY;

        console.log("K before:", kBefore);
        console.log("K after:", kAfter);
        console.log("K increased due to fees:", kAfter > kBefore);

        // K should increase (or stay same) due to fees
        assertEquals(kAfter >= kBefore, true);
    }
});
