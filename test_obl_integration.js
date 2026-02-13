/**
 * OBL Token Integration Test
 * Tests backend API endpoints
 */

const baseURL = 'http://localhost:3001/api/obl';

async function testEndpoint(name, url, options = {}) {
    console.log(`\n[TEST] ${name}`);
    console.log(`[URL] ${url}`);

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok) {
            console.log('✓ SUCCESS');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('✗ FAILED');
            console.log(data);
        }

        return data;
    } catch (error) {
        console.log('✗ ERROR:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('═══════════════════════════════════════');
    console.log('  OBL TOKEN INTEGRATION TESTS');
    console.log('═══════════════════════════════════════');

    // Test 1: Get token info
    await testEndpoint(
        'Get Token Info',
        `${baseURL}/info`
    );

    // Test 2: Get current price
    await testEndpoint(
        'Get Current Price',
        `${baseURL}/price`
    );

    // Test 3: Get price history
    await testEndpoint(
        'Get Price History (last 10)',
        `${baseURL}/price-history?limit=10`
    );

    // Test 4: Get staking stats
    await testEndpoint(
        'Get Staking Stats',
        `${baseURL}/staking-stats`
    );

    // Test 5: Update staking (POST)
    await testEndpoint(
        'Update Staking Stats',
        `${baseURL}/stake`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                totalStaked: 1500000,
                totalStakers: 200
            })
        }
    );

    // Test 6: Get distribution
    await testEndpoint(
        'Get Token Distribution',
        `${baseURL}/distribution`
    );

    // Test 7: Get complete stats
    await testEndpoint(
        'Get Complete Stats',
        `${baseURL}/stats`
    );

    // Test 8: Admin - Set price (testing endpoint)
    await testEndpoint(
        'Admin: Set Price',
        `${baseURL}/admin/set-price`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                price: 0.12
            })
        }
    );

    console.log('\n═══════════════════════════════════════');
    console.log('  TESTS COMPLETED');
    console.log('═══════════════════════════════════════\n');
}

// Run tests
runTests().catch(console.error);
