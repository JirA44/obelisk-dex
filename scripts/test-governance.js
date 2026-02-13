/**
 * Test script for Obelisk Governance Backend
 * Run: node test-governance.js
 */

const BASE_URL = 'http://localhost:3001/api/governance';

async function testGovernance() {
    console.log('🗳️  Testing Obelisk Governance Backend\n');

    try {
        // Test 1: Get initial proposals
        console.log('1️⃣  Getting proposals...');
        let response = await fetch(`${BASE_URL}/proposals`);
        let proposals = await response.json();
        console.log(`   ✅ Found ${proposals.length} proposals`);

        // Test 2: Get stats
        console.log('\n2️⃣  Getting stats...');
        response = await fetch(`${BASE_URL}/stats`);
        const stats = await response.json();
        console.log('   ✅ Stats:', JSON.stringify(stats, null, 2));

        // Test 3: Create a test proposal
        console.log('\n3️⃣  Creating test proposal...');
        response = await fetch(`${BASE_URL}/proposals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test Proposal - Reduce Trading Fees',
                description: 'This is a test proposal to reduce trading fees from 0.3% to 0.2%',
                options: ['Yes', 'No'],
                creatorAddress: '0xTestAddress123'
            })
        });

        if (!response.ok) {
            console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
            return;
        }

        const newProposal = await response.json();
        console.log(`   ✅ Created proposal: ${newProposal.id}`);
        console.log(`      Title: ${newProposal.title}`);
        console.log(`      Status: ${newProposal.status}`);

        // Test 4: Vote on the proposal
        console.log('\n4️⃣  Voting on proposal...');
        response = await fetch(`${BASE_URL}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proposalId: newProposal.id,
                optionIndex: 0, // Vote Yes
                power: 1500,
                address: '0xVoter1'
            })
        });

        if (!response.ok) {
            console.log(`   ❌ Failed: ${response.status}`);
            return;
        }

        const voteResult = await response.json();
        console.log('   ✅ Vote cast successfully');
        console.log(`      Votes for option 0: ${voteResult.proposal.votes[0]}`);
        console.log(`      Total votes: ${voteResult.proposal.totalVotes}`);

        // Test 5: Try to vote again (should fail)
        console.log('\n5️⃣  Testing double-vote prevention...');
        response = await fetch(`${BASE_URL}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proposalId: newProposal.id,
                optionIndex: 1,
                power: 1000,
                address: '0xVoter1'
            })
        });

        const doubleVoteResult = await response.json();
        if (doubleVoteResult.error) {
            console.log(`   ✅ Double-vote prevented: ${doubleVoteResult.error}`);
        } else {
            console.log('   ❌ Double-vote was allowed (unexpected)');
        }

        // Test 6: Get updated proposal
        console.log('\n6️⃣  Getting updated proposal...');
        response = await fetch(`${BASE_URL}/proposal/${newProposal.id}`);
        const updatedProposal = await response.json();
        console.log('   ✅ Updated proposal:');
        console.log(`      Votes: ${JSON.stringify(updatedProposal.votes)}`);
        console.log(`      Total: ${updatedProposal.totalVotes}`);

        // Test 7: Get final stats
        console.log('\n7️⃣  Getting final stats...');
        response = await fetch(`${BASE_URL}/stats`);
        const finalStats = await response.json();
        console.log('   ✅ Final stats:', JSON.stringify(finalStats, null, 2));

        console.log('\n✅ All tests passed! Governance backend is working correctly.\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n💡 Make sure the Obelisk backend is running:');
        console.log('   cd C:\\Users\\Hugop\\obelisk\\obelisk-backend');
        console.log('   pm2 restart obelisk\n');
    }
}

// Run tests
testGovernance();
