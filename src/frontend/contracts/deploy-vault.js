/**
 * OBELISK Vault Deployment Script
 *
 * Deploie le contrat ObeliskVault sur Arbitrum
 *
 * Usage:
 *   node deploy-vault.js [network]
 *
 * Networks:
 *   - arbitrum (mainnet)
 *   - arbitrum-sepolia (testnet)
 *   - localhost (Hardhat)
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ===========================================
// CONFIGURATION
// ===========================================

const NETWORKS = {
  'arbitrum': {
    rpc: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    explorer: 'https://arbiscan.io',
  },
  'arbitrum-sepolia': {
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    chainId: 421614,
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Test USDC
    explorer: 'https://sepolia.arbiscan.io',
  },
  'localhost': {
    rpc: 'http://127.0.0.1:8545',
    chainId: 31337,
    usdc: '0x0000000000000000000000000000000000000000', // Deploy mock
    explorer: null,
  }
};

// Compiled contract ABI and bytecode (from Hardhat/Foundry)
// You need to compile the contract first
const VAULT_ABI = [
  "constructor(address _usdc)",
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getBalance(address user) external view returns (uint256)",
  "function emergencyWithdraw() external",
  "function addOperator(address operator) external",
  "function removeOperator(address operator) external",
  "function setMinDeposit(uint256 newMin) external",
  "function setMaxDeposit(uint256 newMax) external",
  "function pause() external",
  "function unpause() external",
  "function getVaultStats() external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function balances(address) external view returns (uint256)",
  "function totalDeposits() external view returns (uint256)",
  "function minDeposit() external view returns (uint256)",
  "function maxDepositPerUser() external view returns (uint256)",
  "function operators(address) external view returns (bool)",
  "function usdc() external view returns (address)",
  "event Deposited(address indexed user, uint256 amount, uint256 newBalance)",
  "event Withdrawn(address indexed user, uint256 amount, uint256 newBalance)",
  "event OperatorAdded(address indexed operator)",
  "event OperatorRemoved(address indexed operator)",
];

// ===========================================
// DEPLOYMENT
// ===========================================

async function deploy(networkName = 'arbitrum-sepolia') {
  console.log('==========================================');
  console.log('   OBELISK VAULT DEPLOYMENT');
  console.log('==========================================');
  console.log(`Network: ${networkName}`);
  console.log('');

  // Get network config
  const network = NETWORKS[networkName];
  if (!network) {
    console.error(`Unknown network: ${networkName}`);
    console.log('Available networks:', Object.keys(NETWORKS).join(', '));
    process.exit(1);
  }

  // Check for private key
  const privateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error('ERROR: PRIVATE_KEY not set in environment');
    console.log('Set it with: export PRIVATE_KEY=0x...');
    process.exit(1);
  }

  // Connect to network
  console.log(`Connecting to ${network.rpc}...`);
  const provider = new ethers.JsonRpcProvider(network.rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Deployer: ${wallet.address}`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther('0.01')) {
    console.error('ERROR: Insufficient balance for deployment');
    process.exit(1);
  }

  // Load compiled bytecode
  const bytecodeFile = path.join(__dirname, 'ObeliskVault.bytecode');
  if (!fs.existsSync(bytecodeFile)) {
    console.error('ERROR: Contract not compiled');
    console.log('');
    console.log('Compile the contract first:');
    console.log('  npx hardhat compile');
    console.log('  # or');
    console.log('  forge build');
    console.log('');
    console.log('Then copy the bytecode to ObeliskVault.bytecode');
    process.exit(1);
  }

  const bytecode = fs.readFileSync(bytecodeFile, 'utf8').trim();

  // Deploy contract
  console.log('');
  console.log('Deploying ObeliskVault...');
  console.log(`USDC Address: ${network.usdc}`);

  const factory = new ethers.ContractFactory(VAULT_ABI, bytecode, wallet);
  const contract = await factory.deploy(network.usdc);

  console.log(`Transaction: ${contract.deploymentTransaction().hash}`);
  console.log('Waiting for confirmation...');

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log('');
  console.log('==========================================');
  console.log('   DEPLOYMENT SUCCESSFUL!');
  console.log('==========================================');
  console.log(`Contract Address: ${contractAddress}`);
  if (network.explorer) {
    console.log(`Explorer: ${network.explorer}/address/${contractAddress}`);
  }
  console.log('');

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: network.chainId,
    contractAddress,
    usdc: network.usdc,
    deployer: wallet.address,
    deployedAt: new Date().toISOString(),
    txHash: contract.deploymentTransaction().hash,
  };

  const deploymentsFile = path.join(__dirname, 'deployments.json');
  let deployments = {};
  if (fs.existsSync(deploymentsFile)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsFile, 'utf8'));
  }
  deployments[networkName] = deploymentInfo;
  fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));

  console.log('Deployment info saved to deployments.json');
  console.log('');
  console.log('Next steps:');
  console.log(`1. Update .env: VAULT_CONTRACT=${contractAddress}`);
  console.log('2. Verify contract on Arbiscan (optional)');
  console.log('3. Add operators for DeFi integrations');

  return contractAddress;
}

// ===========================================
// VERIFY CONTRACT
// ===========================================

async function verify(networkName, contractAddress) {
  const network = NETWORKS[networkName];
  if (!network || !network.explorer) {
    console.log('Verification not available for this network');
    return;
  }

  console.log('');
  console.log('To verify on Arbiscan:');
  console.log(`npx hardhat verify --network ${networkName} ${contractAddress} "${network.usdc}"`);
}

// ===========================================
// CLI
// ===========================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const network = args[0] || 'arbitrum-sepolia';

  deploy(network)
    .then((address) => {
      verify(network, address);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Deployment failed:', err);
      process.exit(1);
    });
}

module.exports = { deploy, NETWORKS, VAULT_ABI };
