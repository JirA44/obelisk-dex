require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Ethereum Mainnet
    ethereum: {
      url: process.env.ETH_RPC || "https://eth.llamarpc.com",
      chainId: 1,
      accounts: [PRIVATE_KEY]
    },
    // Ethereum Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: [PRIVATE_KEY]
    },
    // Arbitrum One
    arbitrum: {
      url: process.env.ARB_RPC || "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: [PRIVATE_KEY]
    },
    // Arbitrum Sepolia Testnet
    arbitrumSepolia: {
      url: process.env.ARB_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: [PRIVATE_KEY]
    },
    // Base Mainnet
    base: {
      url: process.env.BASE_RPC || "https://mainnet.base.org",
      chainId: 8453,
      accounts: [PRIVATE_KEY]
    },
    // Base Sepolia Testnet
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      chainId: 84532,
      accounts: [PRIVATE_KEY]
    },
    // RSK Mainnet (Bitcoin Sidechain - EVM compatible)
    rsk: {
      url: process.env.RSK_RPC || "https://public-node.rsk.co",
      chainId: 30,
      accounts: [PRIVATE_KEY],
      gasPrice: 60000000
    },
    // RSK Testnet
    rskTestnet: {
      url: process.env.RSK_TESTNET_RPC || "https://public-node.testnet.rsk.co",
      chainId: 31,
      accounts: [PRIVATE_KEY],
      gasPrice: 60000000
    },
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_KEY || "",
      sepolia: process.env.ETHERSCAN_KEY || "",
      arbitrumOne: process.env.ARBISCAN_KEY || "",
      arbitrumSepolia: process.env.ARBISCAN_KEY || "",
      base: process.env.BASESCAN_KEY || "",
      baseSepolia: process.env.BASESCAN_KEY || ""
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
      {
        network: "rsk",
        chainId: 30,
        urls: {
          apiURL: "https://blockscout.com/rsk/mainnet/api",
          browserURL: "https://explorer.rsk.co"
        }
      }
    ]
  },
  gasReporter: {
    enabled: true,
    currency: "USD"
  }
};
