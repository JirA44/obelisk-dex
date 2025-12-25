const hre = require("hardhat");

// WETH/WRBTC addresses per chain
const WRAPPED_NATIVE = {
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",       // Ethereum Mainnet - WETH
  11155111: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // Sepolia - WETH
  42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",    // Arbitrum One - WETH
  421614: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",   // Arbitrum Sepolia - WETH
  8453: "0x4200000000000000000000000000000000000006",     // Base - WETH
  84532: "0x4200000000000000000000000000000000000006",    // Base Sepolia - WETH
  30: "0x542fDA317318eBF1d3DEAf76E0b632741A7e677d",       // RSK Mainnet - WRBTC
  31: "0x09B6Ca5E4496238a1F176aEA6bB607db96C2286E"        // RSK Testnet - WRBTC
};

const CHAIN_NAMES = {
  1: "Ethereum",
  11155111: "Sepolia",
  42161: "Arbitrum One",
  421614: "Arbitrum Sepolia",
  8453: "Base",
  84532: "Base Sepolia",
  30: "RSK (Bitcoin)",
  31: "RSK Testnet"
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  const chainName = CHAIN_NAMES[chainId] || hre.network.name;
  const isRSK = chainId === 30n || chainId === 31n;
  const nativeSymbol = isRSK ? "RBTC" : "ETH";
  const wrappedSymbol = isRSK ? "WRBTC" : "WETH";

  console.log("========================================");
  console.log("OBELISK DEX DEPLOYMENT");
  console.log("========================================");
  console.log("Network:", chainName);
  console.log("Chain ID:", chainId);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), nativeSymbol);
  console.log("========================================\n");

  const wrappedAddress = WRAPPED_NATIVE[chainId];
  if (!wrappedAddress) {
    throw new Error(`Wrapped native token address not configured for chain ${chainId}`);
  }
  console.log(`${wrappedSymbol} Address:`, wrappedAddress);

  // Deploy Factory
  console.log("\n[1/2] Deploying ObeliskFactory...");
  const Factory = await hre.ethers.getContractFactory("ObeliskFactory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("ObeliskFactory deployed to:", factoryAddress);

  // Deploy Router
  console.log("\n[2/2] Deploying ObeliskRouter...");
  const Router = await hre.ethers.getContractFactory("ObeliskRouter");
  const router = await Router.deploy(factoryAddress, wrappedAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("ObeliskRouter deployed to:", routerAddress);

  // Summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("Chain:", chainName);
  console.log("Factory:", factoryAddress);
  console.log("Router:", routerAddress);
  console.log(`${wrappedSymbol}:`, wrappedAddress);
  console.log("========================================");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainName: chainName,
    chainId: Number(chainId),
    deployer: deployer.address,
    contracts: {
      factory: factoryAddress,
      router: routerAddress,
      wrappedNative: wrappedAddress,
      wrappedNativeSymbol: wrappedSymbol
    },
    timestamp: new Date().toISOString()
  };

  const fs = require("fs");
  const deploymentPath = `./deployments/${hre.network.name}.json`;
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentPath}`);

  // Verify contracts on block explorer
  if (chainId !== 31337n) {
    console.log("\nWaiting 30s before verification...");
    await new Promise(r => setTimeout(r, 30000));

    try {
      console.log("Verifying Factory...");
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [deployer.address]
      });
    } catch (e) {
      console.log("Factory verification failed:", e.message);
    }

    try {
      console.log("Verifying Router...");
      await hre.run("verify:verify", {
        address: routerAddress,
        constructorArguments: [factoryAddress, wrappedAddress]
      });
    } catch (e) {
      console.log("Router verification failed:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
