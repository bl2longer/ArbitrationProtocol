const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAppRegistry", function () {
  let dappRegistry;
  let configManager;
  let owner;
  let dappOwner;
  let otherAccount;
  let dappContract;
  let feeCollector;

  const REGISTRATION_FEE = ethers.parseEther("10"); // 10 ETH

  beforeEach(async function () {
    [owner, dappOwner, otherAccount, dappContract, feeCollector] = await ethers.getSigners();
    
    // Deploy ConfigManager first
    const ConfigManager = await ethers.getContractFactory("ConfigManager");
    configManager = await ConfigManager.deploy(owner.address);
    await configManager.waitForDeployment();

    // Set fee collector in ConfigManager
    await configManager.connect(owner).setSystemFeeCollector(feeCollector.address);

    // Deploy DAppRegistry with ConfigManager
    const DAppRegistry = await ethers.getContractFactory("DAppRegistry");
    dappRegistry = await DAppRegistry.deploy(await configManager.getAddress(), owner.address);
    await dappRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await dappRegistry.owner()).to.equal(owner.address);
    });

    it("Should set the correct registration fee", async function () {
      expect(await dappRegistry.REGISTRATION_FEE()).to.equal(REGISTRATION_FEE);
    });

    it("Should set the correct config manager", async function () {
      expect(await dappRegistry.configManager()).to.equal(await configManager.getAddress());
    });
  });

  describe("DApp Registration", function () {
    it("Should register a new DApp with correct fee", async function () {
      const initialFeeCollectorBalance = await ethers.provider.getBalance(feeCollector.address);

      await expect(dappRegistry.connect(dappOwner).registerDApp(dappContract.address, { value: REGISTRATION_FEE }))
        .to.emit(dappRegistry, "DAppRegistered")
        .withArgs(dappContract.address, dappOwner.address);

      expect(await dappRegistry.isRegistered(dappContract.address)).to.be.true;
      expect(await dappRegistry.getDAppOwner(dappContract.address)).to.equal(dappOwner.address);
      expect(await dappRegistry.getDAppStatus(dappContract.address)).to.equal(1); // Pending status

      // Verify fee transfer
      const finalFeeCollectorBalance = await ethers.provider.getBalance(feeCollector.address);
      expect(finalFeeCollectorBalance - initialFeeCollectorBalance).to.equal(REGISTRATION_FEE);
    });

    it("Should fail to register with insufficient fee", async function () {
      const insufficientFee = REGISTRATION_FEE - ethers.parseEther("1");
      await expect(
        dappRegistry.connect(dappOwner).registerDApp(dappContract.address, { value: insufficientFee })
      ).to.be.revertedWithCustomError(dappRegistry, "INSUFFICIENT_FEE");
    });

    it("Should fail to register zero address", async function () {
      await expect(
        dappRegistry.connect(dappOwner).registerDApp(ethers.ZeroAddress, { value: REGISTRATION_FEE })
      ).to.be.revertedWithCustomError(dappRegistry, "ZERO_ADDRESS");
    });

    it("Should fail to register already registered DApp", async function () {
      await dappRegistry.connect(dappOwner).registerDApp(dappContract.address, { value: REGISTRATION_FEE });
      await expect(
        dappRegistry.connect(dappOwner).registerDApp(dappContract.address, { value: REGISTRATION_FEE })
      ).to.be.revertedWithCustomError(dappRegistry, "DAPP_ALREADY_REGISTERED");
    });
  });

  describe("DApp Authorization", function () {
    beforeEach(async function () {
      await dappRegistry.connect(dappOwner).registerDApp(dappContract.address, { value: REGISTRATION_FEE });
    });

    it("Should authorize registered DApp", async function () {
      await expect(dappRegistry.connect(owner).authorizeDApp(dappContract.address))
        .to.emit(dappRegistry, "DAppAuthorized")
        .withArgs(dappContract.address);

      expect(await dappRegistry.getDAppStatus(dappContract.address)).to.equal(2); // Active status
    });

    it("Should fail to authorize unregistered DApp", async function () {
      const unregisteredDApp = otherAccount.address;
      await expect(
        dappRegistry.connect(owner).authorizeDApp(unregisteredDApp)
      ).to.be.revertedWithCustomError(dappRegistry, "DAPP_NOT_REGISTERED");
    });

    it("Should fail if non-owner tries to authorize", async function () {
      await expect(
        dappRegistry.connect(otherAccount).authorizeDApp(dappContract.address)
      ).to.be.revertedWithCustomError(dappRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("DApp Status Queries", function () {
    beforeEach(async function () {
      await dappRegistry.connect(dappOwner).registerDApp(dappContract.address, { value: REGISTRATION_FEE });
    });

    it("Should return correct registration status", async function () {
      expect(await dappRegistry.isRegistered(dappContract.address)).to.be.true;
      expect(await dappRegistry.isRegistered(otherAccount.address)).to.be.false;
    });

    it("Should return correct DApp owner", async function () {
      expect(await dappRegistry.getDAppOwner(dappContract.address)).to.equal(dappOwner.address);
    });

    it("Should return correct DApp status throughout lifecycle", async function () {
      // Initial status after registration
      expect(await dappRegistry.getDAppStatus(dappContract.address)).to.equal(1); // Pending

      // Status after authorization
      await dappRegistry.connect(owner).authorizeDApp(dappContract.address);
      expect(await dappRegistry.getDAppStatus(dappContract.address)).to.equal(2); // Active
    });
  });
});
