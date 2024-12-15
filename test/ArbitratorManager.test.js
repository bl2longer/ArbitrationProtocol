const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArbitratorManager", function () {
  let configManager;
  let arbitratorManager;
  let transactionManager;
  let dappRegistry;
  let mockNFT;
  let mockNFTInfo;
  let compensationManager;
  let owner;
  let arbitrator;
  let operator;
  let other;
  
  const feeRate = 1000; // 10% annual rate
  const stakeAmount = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, arbitrator, operator, other] = await ethers.getSigners();

    // Deploy mock contracts
    const MockNFT = await ethers.getContractFactory("MockNFT");
    mockNFT = await MockNFT.deploy();
    await mockNFT.waitForDeployment();

    const MockNFTInfo = await ethers.getContractFactory("MockNFTInfo");
    mockNFTInfo = await MockNFTInfo.deploy();
    await mockNFTInfo.waitForDeployment();

    // Deploy ConfigManager
    const ConfigManager = await ethers.getContractFactory("ConfigManager");
    configManager = await ConfigManager.deploy(owner.address);
    await configManager.waitForDeployment();

    // Deploy DAppRegistry
    const DAppRegistry = await ethers.getContractFactory("DAppRegistry");
    dappRegistry = await DAppRegistry.deploy(await configManager.getAddress(), owner.address);
    await dappRegistry.waitForDeployment();

    // Deploy ArbitratorManager
    const ArbitratorManager = await ethers.getContractFactory("ArbitratorManager");
    arbitratorManager = await ArbitratorManager.deploy(
      await configManager.getAddress(),
      owner.address,
      await mockNFT.getAddress(),
      await mockNFTInfo.getAddress()
    );
    await arbitratorManager.waitForDeployment();

    // Deploy TransactionManager
    const TransactionManager = await ethers.getContractFactory("TransactionManager");
    transactionManager = await TransactionManager.deploy(
      await arbitratorManager.getAddress(),
      await dappRegistry.getAddress(),
      await configManager.getAddress(),
      owner.address
    );
    await transactionManager.waitForDeployment();

    // Deploy CompensationManager
    const CompensationManager = await ethers.getContractFactory("CompensationManager");
    compensationManager = await CompensationManager.deploy(
      ethers.ZeroAddress, // Mock ZkService not needed for this test
      await transactionManager.getAddress(),
      await configManager.getAddress(),
      await arbitratorManager.getAddress()
    );
    await compensationManager.waitForDeployment();

    // Initialize contracts
    await arbitratorManager.initialize(
      await transactionManager.getAddress(),
      await compensationManager.getAddress()
    );

    // Set minimum stake in ConfigManager
    await configManager.setMinStake(ethers.parseEther("10"));
  });

  describe("Staking", function () {
    it("Should register new arbitrator with correct stake and fee rate", async function () {
      await arbitratorManager.connect(arbitrator).stakeETH({ value: stakeAmount });
      
      const arbitratorInfo = await arbitratorManager.getArbitratorInfo(arbitrator.address);
      expect(arbitratorInfo.ethAmount).to.equal(stakeAmount);

      await arbitratorManager.connect(arbitrator).setOperator(
        arbitrator.address,
        "0x03f028892bad7ed57d2fb57bf33081d5cfcf6f9ed3d3d7f159c2e2fff579dc341a",
        "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" // Example Bitcoin address
      );

    });
  });

  describe("Initialization", function () {
    let newArbitratorManager;

    beforeEach(async function () {
      const ArbitratorManager = await ethers.getContractFactory("ArbitratorManager");
      newArbitratorManager = await ArbitratorManager.deploy(
        await configManager.getAddress(),
        owner.address,
        await mockNFT.getAddress(),
        await mockNFTInfo.getAddress()
      );
      await newArbitratorManager.waitForDeployment();
    });

    it("Should initialize with transaction manager", async function () {
      await newArbitratorManager.initialize(await transactionManager.getAddress(), await compensationManager.getAddress());
      expect(await newArbitratorManager.transactionManager()).to.equal(await transactionManager.getAddress());
    });

    it("Should fail to initialize twice", async function () {
      await newArbitratorManager.initialize(await transactionManager.getAddress(), await compensationManager.getAddress());
      await expect(
        newArbitratorManager.initialize(await transactionManager.getAddress(), await compensationManager.getAddress())
      ).to.be.revertedWithCustomError(newArbitratorManager, "ALREADY_INITIALIZED");
    });

    it("Should fail to initialize with zero address", async function () {
      await expect(
        newArbitratorManager.initialize(ethers.ZeroAddress, await compensationManager.getAddress())
      ).to.be.revertedWithCustomError(newArbitratorManager, "ZERO_ADDRESS");
    });
  });

  describe("Arbitrator Working Status", function () {
    let transactionId;

    beforeEach(async function () {
      transactionId = ethers.ZeroHash;
    });

    it("Should set arbitrator to working status", async function () {
      // Create a signer for transaction manager
      const transactionManagerSigner = await ethers.getImpersonatedSigner(await transactionManager.getAddress());
      // Send some ETH to transaction manager
      await owner.sendTransaction({
        to: await transactionManager.getAddress(),
        value: ethers.parseEther("1.0")
      });
      await arbitratorManager.connect(transactionManagerSigner).setArbitratorWorking(arbitrator.address, transactionId);

      const arbitratorInfo = await arbitratorManager.getArbitratorInfo(arbitrator.address);
      expect(arbitratorInfo.isWorking).to.be.true;
      expect(arbitratorInfo.activeTransactionId).to.equal(transactionId);
    });

    it("Should fail to set working status if not transaction manager", async function () {
      await expect(
        arbitratorManager.connect(other).setArbitratorWorking(arbitrator.address, transactionId)
      ).to.be.revertedWithCustomError(arbitratorManager, "NOT_TRANSACTION_MANAGER");
    });

    it("Should fail to set working status if already working", async function () {
      // Create a signer for transaction manager
      const transactionManagerSigner = await ethers.getImpersonatedSigner(await transactionManager.getAddress());
      // Send some ETH to transaction manager
      await owner.sendTransaction({
        to: await transactionManager.getAddress(),
        value: ethers.parseEther("1.0")
      });
      await arbitratorManager.connect(transactionManagerSigner).setArbitratorWorking(arbitrator.address, transactionId);

      await expect(
        arbitratorManager.connect(transactionManagerSigner).setArbitratorWorking(arbitrator.address, transactionId)
      ).to.be.revertedWithCustomError(arbitratorManager, "ARBITRATOR_ALREADY_WORKING");
    });

    it("Should release arbitrator from working status", async function () {
      // Create a signer for transaction manager
      const transactionManagerSigner = await ethers.getImpersonatedSigner(await transactionManager.getAddress());
      // Send some ETH to transaction manager
      await owner.sendTransaction({
        to: await transactionManager.getAddress(),
        value: ethers.parseEther("1.0")
      });
      await arbitratorManager.connect(transactionManagerSigner).setArbitratorWorking(arbitrator.address, transactionId);
      await arbitratorManager.connect(transactionManagerSigner).releaseArbitrator(arbitrator.address, transactionId);

      const arbitratorInfo = await arbitratorManager.getArbitratorInfo(arbitrator.address);
      expect(arbitratorInfo.isWorking).to.be.false;
      expect(arbitratorInfo.activeTransactionId).to.equal(ethers.ZeroHash);
    });

    it("Should fail to release if wrong transaction ID", async function () {
      // Create a signer for transaction manager
      const transactionManagerSigner = await ethers.getImpersonatedSigner(await transactionManager.getAddress());
      // Send some ETH to transaction manager
      await owner.sendTransaction({
        to: await transactionManager.getAddress(),
        value: ethers.parseEther("1.0")
      });
      await arbitratorManager.connect(transactionManagerSigner).setArbitratorWorking(arbitrator.address, transactionId);

      const wrongTransactionId = "0x1234567890123456789012345678901234567890123456789012345678901234";
      await expect(
        arbitratorManager.connect(transactionManagerSigner).releaseArbitrator(arbitrator.address, wrongTransactionId)
      ).to.be.revertedWithCustomError(arbitratorManager, "WRONG_TRANSACTION_ID");
    });

    it("Should fail to release if not working", async function () {
      // Create a signer for transaction manager
      const transactionManagerSigner = await ethers.getImpersonatedSigner(await transactionManager.getAddress());
      // Send some ETH to transaction manager
      await owner.sendTransaction({
        to: await transactionManager.getAddress(),
        value: ethers.parseEther("1.0")
      });
      await expect(
        arbitratorManager.connect(transactionManagerSigner).releaseArbitrator(arbitrator.address, transactionId)
      ).to.be.revertedWithCustomError(arbitratorManager, "ARBITRATOR_NOT_WORKING");
    });
  });
});
