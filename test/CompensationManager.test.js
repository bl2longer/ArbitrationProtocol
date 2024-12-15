const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CompensationManager", function () {
    let zkService;
    let compensationManager;
    let transactionManager;
    let configManager;
    let arbitratorManager;
    let dappRegistry;
    let mockNFT;
    let mockNFTInfo;
    let owner;
    let dapp;
    let arbitrator;
    let user;

    const VALID_BTC_TX = "0x1234567890";
    const VALID_RAW_DATA = "0x1234567890";
    const VALID_PUB_KEY = "0x9876543210";
    const VALID_SIGNATURE = "0xabcdef1234";
    const VALID_TX_HASH = ethers.keccak256("0x1234");
    const STAKE_AMOUNT = ethers.parseEther("1.0");

    beforeEach(async function () {
        [owner, dapp, arbitrator, user] = await ethers.getSigners();

        // Deploy mock contracts
        const MockZkService = await ethers.getContractFactory("MockZkService");
        zkService = await MockZkService.deploy();
        await zkService.waitForDeployment();

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

        // Deploy ArbitratorManager with correct parameters
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

        // Deploy CompensationManager with correct parameters
        const CompensationManager = await ethers.getContractFactory("CompensationManager");
        compensationManager = await CompensationManager.deploy(
            await zkService.getAddress(),
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

        // Setup test environment
        await dappRegistry.connect(owner).registerDApp(dapp.address, { value: ethers.parseEther("10.0") });
        
        // First register arbitrator by staking ETH
        await arbitratorManager.connect(arbitrator).stakeETH({ value: ethers.parseEther("1.0") });

        // Set operator
        await arbitratorManager.connect(arbitrator).setOperator(
            arbitrator.address,
            VALID_PUB_KEY,
            "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" // Example Bitcoin address
        );

        // Set BTC revenue addresses
        await arbitratorManager.connect(arbitrator).setRevenueAddresses(
            arbitrator.address,
            VALID_PUB_KEY,
            "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" // Example Bitcoin address
        );
    });

    describe("claimIllegalSignatureCompensation", function () {
        it("should succeed with valid verification data", async function () {
            const evidence = ethers.keccak256("0x5678");
            
            // Set up valid verification data
            await zkService.setValidVerification(
                evidence,
                VALID_RAW_DATA,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE
            );

            // Test the claim
            await expect(
                compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                    arbitrator.address,
                    VALID_BTC_TX,
                    evidence
                )
            ).to.emit(compensationManager, "CompensationClaimed");
        });

        it("should revert with empty raw data", async function () {
            const evidence = ethers.keccak256("0x5678");
            await zkService.setEmptyRawData(evidence);

            await expect(
                compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                    arbitrator.address,
                    VALID_BTC_TX,
                    evidence
                )
            ).to.be.revertedWithCustomError(compensationManager, "EMPTY_RAW_DATA");
        });

        it("should revert with empty public key", async function () {
            const evidence = ethers.keccak256("0x5678");
            await zkService.setEmptyPubKey(evidence);

            await expect(
                compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                    arbitrator.address,
                    VALID_BTC_TX,
                    evidence
                )
            ).to.be.revertedWithCustomError(compensationManager, "EMPTY_PUBLIC_KEY");
        });

        it("should revert with empty tx hash", async function () {
            const evidence = ethers.keccak256("0x5678");
            await zkService.setEmptyTxHash(evidence);

            await expect(
                compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                    arbitrator.address,
                    VALID_BTC_TX,
                    evidence
                )
            ).to.be.revertedWithCustomError(compensationManager, "EMPTY_HASH");
        });

        it("should revert with invalid verification", async function () {
            const evidence = ethers.keccak256("0x5678");
            await zkService.setInvalidVerification(
                evidence,
                VALID_RAW_DATA,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE
            );

            await expect(
                compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                    arbitrator.address,
                    VALID_BTC_TX,
                    evidence
                )
            ).to.be.revertedWithCustomError(compensationManager, "INVALID_ZK_PROOF");
        });

        it("should revert with malformed raw data", async function () {
            const evidence = ethers.keccak256("0x5678");
            await zkService.setMalformedRawData(evidence);

            await expect(
                compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                    arbitrator.address,
                    VALID_BTC_TX,
                    evidence
                )
            ).to.be.revertedWithCustomError(compensationManager, "BTC_TRANSACTION_MISMATCH");
        });

        it("should revert with malformed public key", async function () {
            const evidence = ethers.keccak256("0x5678");
            await zkService.setMalformedPubKey(evidence);

            await expect(
                compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                    arbitrator.address,
                    VALID_BTC_TX,
                    evidence
                )
            ).to.be.revertedWithCustomError(compensationManager, "PUBLIC_KEY_MISMATCH");
        });

        it("should revert when verification data doesn't exist", async function () {
            const evidence = ethers.keccak256("0x5678");
            // Don't set any verification data

            await expect(
                compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                    arbitrator.address,
                    VALID_BTC_TX,
                    evidence
                )
            ).to.be.revertedWithCustomError(compensationManager, "VERIFICATION_DATA_NOT_FOUND");
        });
    });

    describe("Events", function () {
        it("should emit correct events when setting verification data", async function () {
            const evidence = ethers.keccak256("0x5678");
            
            await expect(zkService.setValidVerification(
                evidence,
                VALID_RAW_DATA,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE
            )).to.emit(zkService, "VerificationDataSet")
              .withArgs(evidence);
        });
    });
});
