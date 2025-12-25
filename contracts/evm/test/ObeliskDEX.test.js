const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Obelisk DEX - Trading Simulations", function () {
  let factory, router, tokenA, tokenB, weth;
  let owner, trader1, trader2, liquidityProvider;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const LIQUIDITY_A = ethers.parseEther("10000");
  const LIQUIDITY_B = ethers.parseEther("20000");

  beforeEach(async function () {
    [owner, trader1, trader2, liquidityProvider] = await ethers.getSigners();

    // Deploy mock tokens
    const MockToken = await ethers.getContractFactory("MockERC20");
    tokenA = await MockToken.deploy("Token A", "TKNA", INITIAL_SUPPLY);
    tokenB = await MockToken.deploy("Token B", "TKNB", INITIAL_SUPPLY);
    weth = await MockToken.deploy("Wrapped ETH", "WETH", INITIAL_SUPPLY);

    // Deploy Factory
    const Factory = await ethers.getContractFactory("ObeliskFactory");
    factory = await Factory.deploy(owner.address);

    // Deploy Router
    const Router = await ethers.getContractFactory("ObeliskRouter");
    router = await Router.deploy(await factory.getAddress(), await weth.getAddress());

    // Distribute tokens
    await tokenA.transfer(trader1.address, ethers.parseEther("10000"));
    await tokenA.transfer(trader2.address, ethers.parseEther("10000"));
    await tokenA.transfer(liquidityProvider.address, ethers.parseEther("50000"));
    await tokenB.transfer(trader1.address, ethers.parseEther("10000"));
    await tokenB.transfer(trader2.address, ethers.parseEther("10000"));
    await tokenB.transfer(liquidityProvider.address, ethers.parseEther("50000"));
  });

  describe("Pool Creation", function () {
    it("should create a new trading pair", async function () {
      await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
      const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
      expect(pairAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should emit PairCreated event", async function () {
      await expect(factory.createPair(await tokenA.getAddress(), await tokenB.getAddress()))
        .to.emit(factory, "PairCreated");
    });

    it("should revert on duplicate pair", async function () {
      await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
      await expect(factory.createPair(await tokenA.getAddress(), await tokenB.getAddress()))
        .to.be.revertedWith("PAIR_EXISTS");
    });
  });

  describe("Liquidity Operations", function () {
    beforeEach(async function () {
      await tokenA.connect(liquidityProvider).approve(await router.getAddress(), LIQUIDITY_A);
      await tokenB.connect(liquidityProvider).approve(await router.getAddress(), LIQUIDITY_B);
    });

    it("should add initial liquidity", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await router.connect(liquidityProvider).addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        LIQUIDITY_A,
        LIQUIDITY_B,
        0,
        0,
        liquidityProvider.address,
        deadline
      );

      const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
      const pair = await ethers.getContractAt("ObeliskPair", pairAddress);
      const reserves = await pair.getReserves();

      expect(reserves[0]).to.equal(LIQUIDITY_A);
      expect(reserves[1]).to.equal(LIQUIDITY_B);
    });

    it("should calculate correct LP tokens", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await router.connect(liquidityProvider).addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        LIQUIDITY_A,
        LIQUIDITY_B,
        0,
        0,
        liquidityProvider.address,
        deadline
      );

      const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
      const pair = await ethers.getContractAt("ObeliskPair", pairAddress);
      const lpBalance = await pair.balanceOf(liquidityProvider.address);

      // sqrt(10000 * 20000) - 1000 = ~14142 - 1000 = ~13142
      const expectedLiquidity = BigInt(Math.floor(Math.sqrt(10000 * 20000))) * BigInt(10**18) - BigInt(1000);
      expect(lpBalance).to.be.closeTo(expectedLiquidity, ethers.parseEther("1"));
    });
  });

  describe("Trading Simulations", function () {
    beforeEach(async function () {
      // Add liquidity
      await tokenA.connect(liquidityProvider).approve(await router.getAddress(), LIQUIDITY_A);
      await tokenB.connect(liquidityProvider).approve(await router.getAddress(), LIQUIDITY_B);

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await router.connect(liquidityProvider).addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        LIQUIDITY_A,
        LIQUIDITY_B,
        0,
        0,
        liquidityProvider.address,
        deadline
      );
    });

    it("should execute swap with correct price calculation (0.3% fee)", async function () {
      const swapAmount = ethers.parseEther("100");
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await tokenA.connect(trader1).approve(await router.getAddress(), swapAmount);

      // Calculate expected output: (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
      // (100 * 997 * 20000) / (10000 * 1000 + 100 * 997) = 1994000000 / 10099700 = ~197.43
      const reserveIn = 10000n;
      const reserveOut = 20000n;
      const amountIn = 100n;
      const amountInWithFee = amountIn * 997n;
      const numerator = amountInWithFee * reserveOut;
      const denominator = reserveIn * 1000n + amountInWithFee;
      const expectedOut = numerator / denominator;

      console.log("\n=== SWAP SIMULATION ===");
      console.log("Input:", amountIn.toString(), "Token A");
      console.log("Expected Output:", expectedOut.toString(), "Token B");
      console.log("Price Impact:", ((1 - Number(expectedOut) / (Number(amountIn) * 2)) * 100).toFixed(2), "%");

      const balanceBefore = await tokenB.balanceOf(trader1.address);

      await router.connect(trader1).swapExactTokensForTokens(
        swapAmount,
        0,
        [await tokenA.getAddress(), await tokenB.getAddress()],
        trader1.address,
        deadline
      );

      const balanceAfter = await tokenB.balanceOf(trader1.address);
      const received = balanceAfter - balanceBefore;

      console.log("Actual Output:", ethers.formatEther(received), "Token B");
      expect(received).to.be.closeTo(expectedOut * BigInt(10**18), ethers.parseEther("0.1"));
    });

    it("should handle multiple sequential swaps", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      console.log("\n=== MULTIPLE SWAPS SIMULATION ===");

      for (let i = 0; i < 5; i++) {
        const swapAmount = ethers.parseEther("50");
        await tokenA.connect(trader1).approve(await router.getAddress(), swapAmount);

        const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
        const pair = await ethers.getContractAt("ObeliskPair", pairAddress);
        const reservesBefore = await pair.getReserves();

        const balanceBBefore = await tokenB.balanceOf(trader1.address);

        await router.connect(trader1).swapExactTokensForTokens(
          swapAmount,
          0,
          [await tokenA.getAddress(), await tokenB.getAddress()],
          trader1.address,
          deadline
        );

        const balanceBAfter = await tokenB.balanceOf(trader1.address);
        const reservesAfter = await pair.getReserves();

        console.log(`Swap ${i + 1}:`);
        console.log(`  Reserve A: ${ethers.formatEther(reservesBefore[0])} -> ${ethers.formatEther(reservesAfter[0])}`);
        console.log(`  Reserve B: ${ethers.formatEther(reservesBefore[1])} -> ${ethers.formatEther(reservesAfter[1])}`);
        console.log(`  Received: ${ethers.formatEther(balanceBAfter - balanceBBefore)} Token B`);
      }
    });

    it("should verify constant product formula (x * y = k)", async function () {
      const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
      const pair = await ethers.getContractAt("ObeliskPair", pairAddress);

      const reservesBefore = await pair.getReserves();
      const kBefore = reservesBefore[0] * reservesBefore[1];

      console.log("\n=== CONSTANT PRODUCT VERIFICATION ===");
      console.log("K before:", ethers.formatEther(kBefore.toString()));

      // Execute swap
      const swapAmount = ethers.parseEther("500");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await tokenA.connect(trader1).approve(await router.getAddress(), swapAmount);

      await router.connect(trader1).swapExactTokensForTokens(
        swapAmount,
        0,
        [await tokenA.getAddress(), await tokenB.getAddress()],
        trader1.address,
        deadline
      );

      const reservesAfter = await pair.getReserves();
      const kAfter = reservesAfter[0] * reservesAfter[1];

      console.log("K after:", ethers.formatEther(kAfter.toString()));
      console.log("K increased (from fees):", kAfter > kBefore);

      // K should increase due to fees
      expect(kAfter).to.be.gte(kBefore);
    });

    it("should calculate accurate price quotes", async function () {
      console.log("\n=== PRICE QUOTE VERIFICATION ===");

      const amounts = [
        ethers.parseEther("1"),
        ethers.parseEther("10"),
        ethers.parseEther("100"),
        ethers.parseEther("1000")
      ];

      for (const amount of amounts) {
        const quote = await router.getAmountsOut(amount, [
          await tokenA.getAddress(),
          await tokenB.getAddress()
        ]);

        const priceImpact = (1 - Number(quote[1]) / (Number(amount) * 2)) * 100;

        console.log(`${ethers.formatEther(amount)} A -> ${ethers.formatEther(quote[1])} B (impact: ${priceImpact.toFixed(2)}%)`);
      }
    });

    it("should handle arbitrage between traders", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      console.log("\n=== ARBITRAGE SIMULATION ===");

      // Trader 1 buys Token B
      const buyAmount = ethers.parseEther("500");
      await tokenA.connect(trader1).approve(await router.getAddress(), buyAmount);

      await router.connect(trader1).swapExactTokensForTokens(
        buyAmount,
        0,
        [await tokenA.getAddress(), await tokenB.getAddress()],
        trader1.address,
        deadline
      );

      const trader1B = await tokenB.balanceOf(trader1.address);
      console.log("Trader 1 bought:", ethers.formatEther(trader1B), "Token B");

      // Trader 2 sells Token B (arbitrage opportunity)
      const sellAmount = ethers.parseEther("200");
      await tokenB.connect(trader2).approve(await router.getAddress(), sellAmount);

      const balanceABefore = await tokenA.balanceOf(trader2.address);

      await router.connect(trader2).swapExactTokensForTokens(
        sellAmount,
        0,
        [await tokenB.getAddress(), await tokenA.getAddress()],
        trader2.address,
        deadline
      );

      const balanceAAfter = await tokenA.balanceOf(trader2.address);
      console.log("Trader 2 received:", ethers.formatEther(balanceAAfter - balanceABefore), "Token A");
    });
  });

  describe("Edge Cases & Security", function () {
    beforeEach(async function () {
      await tokenA.connect(liquidityProvider).approve(await router.getAddress(), LIQUIDITY_A);
      await tokenB.connect(liquidityProvider).approve(await router.getAddress(), LIQUIDITY_B);

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      await router.connect(liquidityProvider).addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        LIQUIDITY_A,
        LIQUIDITY_B,
        0,
        0,
        liquidityProvider.address,
        deadline
      );
    });

    it("should revert on expired deadline", async function () {
      const swapAmount = ethers.parseEther("100");
      const expiredDeadline = Math.floor(Date.now() / 1000) - 3600;

      await tokenA.connect(trader1).approve(await router.getAddress(), swapAmount);

      await expect(
        router.connect(trader1).swapExactTokensForTokens(
          swapAmount,
          0,
          [await tokenA.getAddress(), await tokenB.getAddress()],
          trader1.address,
          expiredDeadline
        )
      ).to.be.revertedWith("EXPIRED");
    });

    it("should revert on insufficient output amount (slippage protection)", async function () {
      const swapAmount = ethers.parseEther("100");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const unrealisticMinOut = ethers.parseEther("1000"); // Way more than possible

      await tokenA.connect(trader1).approve(await router.getAddress(), swapAmount);

      await expect(
        router.connect(trader1).swapExactTokensForTokens(
          swapAmount,
          unrealisticMinOut,
          [await tokenA.getAddress(), await tokenB.getAddress()],
          trader1.address,
          deadline
        )
      ).to.be.revertedWith("INSUFFICIENT_OUTPUT_AMOUNT");
    });

    it("should handle large swap with high price impact", async function () {
      const largeSwap = ethers.parseEther("5000"); // 50% of reserve
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      await tokenA.connect(trader1).approve(await router.getAddress(), largeSwap);

      const quote = await router.getAmountsOut(largeSwap, [
        await tokenA.getAddress(),
        await tokenB.getAddress()
      ]);

      console.log("\n=== HIGH IMPACT SWAP ===");
      console.log("Input:", ethers.formatEther(largeSwap), "Token A");
      console.log("Output:", ethers.formatEther(quote[1]), "Token B");
      console.log("Effective price:", (Number(quote[1]) / Number(largeSwap)).toFixed(4));
      console.log("Ideal price: 2.0000");
      console.log("Price impact:", ((1 - Number(quote[1]) / (Number(largeSwap) * 2)) * 100).toFixed(2), "%");

      // Should still execute
      await router.connect(trader1).swapExactTokensForTokens(
        largeSwap,
        0,
        [await tokenA.getAddress(), await tokenB.getAddress()],
        trader1.address,
        deadline
      );
    });
  });

  describe("Timing & Timestamps", function () {
    it("should use block timestamp (seconds, not milliseconds)", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now in SECONDS

      console.log("\n=== TIMESTAMP VERIFICATION ===");
      console.log("Current timestamp (s):", Math.floor(Date.now() / 1000));
      console.log("Deadline (s):", deadline);
      console.log("Block timestamp uses SECONDS, not milliseconds");

      await tokenA.connect(liquidityProvider).approve(await router.getAddress(), LIQUIDITY_A);
      await tokenB.connect(liquidityProvider).approve(await router.getAddress(), LIQUIDITY_B);

      // This should work with second-based timestamps
      await expect(
        router.connect(liquidityProvider).addLiquidity(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          LIQUIDITY_A,
          LIQUIDITY_B,
          0,
          0,
          liquidityProvider.address,
          deadline
        )
      ).to.not.be.reverted;
    });
  });
});
