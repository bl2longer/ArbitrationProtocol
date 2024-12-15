const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TransactionManager", function () {
    let transactionManager;
    let arbitratorManager;
    let dappRegistry;
    let configManager;
    let compensationManager;
    let mockNFT;
    let mockNFTInfo;
    let owner;
    let dapp;
    let arbitrator;
    let operator;
    let other;

    const SECONDS_PER_YEAR = BigInt(365 * 24 * 60 * 60);
    const FEE_RATE_MULTIPLIER = BigInt(10000);
    const STAKE_AMOUNT = ethers.parseEther("100");
    const FEE_RATE = BigInt(1000); // 10% annual rate
    const MIN_STAKE = ethers.parseEther("10");
    const VALID_PUB_KEY = "0x1234567890";

    beforeEach(async function () {
        [owner, dapp, arbitrator, operator, other] = await ethers.getSigners();

        // Deploy mock contracts
        const MockNFT = await ethers.getContractFactory("MockNFT");
        mockNFT = await MockNFT.deploy();

        const MockNFTInfo = await ethers.getContractFactory("MockNFTInfo");
        mockNFTInfo = await MockNFTInfo.deploy();

        // Deploy ConfigManager
        const ConfigManager = await ethers.getContractFactory("ConfigManager");
        configManager = await ConfigManager.deploy(owner.address);

        // Deploy DAppRegistry
        const DAppRegistry = await ethers.getContractFactory("DAppRegistry");
        dappRegistry = await DAppRegistry.deploy(configManager.address, owner.address);

        // Deploy ArbitratorManager
        const ArbitratorManager = await ethers.getContractFactory("ArbitratorManager");
        arbitratorManager = await ArbitratorManager.deploy(
            configManager.address,
            owner.address,
            mockNFT.address,
            mockNFTInfo.address
        );

        // Deploy TransactionManager
        const TransactionManager = await ethers.getContractFactory("TransactionManager");
        transactionManager = await TransactionManager.deploy(
            configManager.address,
            dappRegistry.address,
            arbitratorManager.address
        );

        // Deploy CompensationManager
        const CompensationManager = await ethers.getContractFactory("CompensationManager");
        compensationManager = await CompensationManager.deploy(
            ethers.ZeroAddress, // Mock ZkService not needed for this test
            transactionManager.address,
            configManager.address,
            arbitratorManager.address
        );

        // Initialize contracts
        await arbitratorManager.initialize(transactionManager.address, compensationManager.address);

        // Setup minimum stake in ConfigManager
        await configManager.setMinStake(MIN_STAKE);

        // Setup test environment
        await dappRegistry.connect(owner).registerDApp(dapp.address);
        await arbitratorManager.connect(arbitrator).registerArbitrator(VALID_PUB_KEY, { value: STAKE_AMOUNT });
    });

    describe("Transaction Registration", function () {
        it("Should register a transaction with correct fee calculation", async function () {
            const txHash = ethers.id("test");
            const amount = ethers.parseEther("1");
            const deadline = await time.latest() + 3600;

            await expect(
                transactionManager.connect(dapp).registerTransaction(
                    txHash,
                    amount,
                    deadline,
                    arbitrator.address
                )
            ).to.emit(transactionManager, "TransactionRegistered")
             .withArgs(
                 ethers.id(txHash),
                 dapp.address,
                 arbitrator.address,
                 amount,
                 deadline
             );
        });

        it("Should fail if arbitrator is not registered", async function () {
            const txHash = ethers.id("test");
            const amount = ethers.parseEther("1");
            const deadline = await time.latest() + 3600;

            await expect(
                transactionManager.connect(dapp).registerTransaction(
                    txHash,
                    amount,
                    deadline,
                    other.address
                )
            ).to.be.revertedWithCustomError(transactionManager, "NOT_REGISTERED_ARBITRATOR");
        });

        it("Should fail if caller is not registered DApp", async function () {
            const txHash = ethers.id("test");
            const amount = ethers.parseEther("1");
            const deadline = await time.latest() + 3600;

            await expect(
                transactionManager.connect(other).registerTransaction(
                    txHash,
                    amount,
                    deadline,
                    arbitrator.address
                )
            ).to.be.revertedWithCustomError(transactionManager, "NOT_REGISTERED_DAPP");
        });

        it("Should fail if deadline is in the past", async function () {
            const txHash = ethers.id("test");
            const amount = ethers.parseEther("1");
            const deadline = await time.latest() - 3600;

            await expect(
                transactionManager.connect(dapp).registerTransaction(
                    txHash,
                    amount,
                    deadline,
                    arbitrator.address
                )
            ).to.be.revertedWithCustomError(transactionManager, "INVALID_DEADLINE");
        });
    });

    describe("Transaction Execution", function () {
        let txHash;
        let amount;
        let deadline;

        beforeEach(async function () {
            txHash = ethers.id("test");
            amount = ethers.parseEther("1");
            deadline = await time.latest() + 3600;

            await transactionManager.connect(dapp).registerTransaction(
                txHash,
                amount,
                deadline,
                arbitrator.address
            );
        });

        it("Should execute transaction successfully", async function () {
            const executionData = "0x1234";
            
            await expect(
                transactionManager.connect(arbitrator).executeTransaction(txHash, executionData)
            ).to.emit(transactionManager, "TransactionExecuted")
             .withArgs(txHash, executionData);

            const tx = await transactionManager.getTransaction(txHash);
            expect(tx.status).to.equal(1); // EXECUTED status
        });

        it("Should fail if transaction does not exist", async function () {
            const nonExistentTxHash = ethers.id("nonexistent");
            const executionData = "0x1234";

            await expect(
                transactionManager.connect(arbitrator).executeTransaction(nonExistentTxHash, executionData)
            ).to.be.revertedWithCustomError(transactionManager, "TRANSACTION_NOT_FOUND");
        });

        it("Should fail if caller is not the assigned arbitrator", async function () {
            const executionData = "0x1234";

            await expect(
                transactionManager.connect(other).executeTransaction(txHash, executionData)
            ).to.be.revertedWithCustomError(transactionManager, "NOT_AUTHORIZED_ARBITRATOR");
        });

        it("Should fail if transaction is already executed", async function () {
            const executionData = "0x1234";
            
            await transactionManager.connect(arbitrator).executeTransaction(txHash, executionData);

            await expect(
                transactionManager.connect(arbitrator).executeTransaction(txHash, executionData)
            ).to.be.revertedWithCustomError(transactionManager, "INVALID_TRANSACTION_STATUS");
        });
    });

    describe("Transaction Cancellation", function () {
        let txHash;
        let amount;
        let deadline;

        beforeEach(async function () {
            txHash = ethers.id("test");
            amount = ethers.parseEther("1");
            deadline = await time.latest() + 3600;

            await transactionManager.connect(dapp).registerTransaction(
                txHash,
                amount,
                deadline,
                arbitrator.address
            );
        });

        it("Should cancel transaction after deadline", async function () {
            await time.increase(3601); // Move past deadline

            await expect(
                transactionManager.connect(dapp).cancelTransaction(txHash)
            ).to.emit(transactionManager, "TransactionCancelled")
             .withArgs(txHash);

            const tx = await transactionManager.getTransaction(txHash);
            expect(tx.status).to.equal(2); // CANCELLED status
        });

        it("Should fail to cancel before deadline", async function () {
            await expect(
                transactionManager.connect(dapp).cancelTransaction(txHash)
            ).to.be.revertedWithCustomError(transactionManager, "DEADLINE_NOT_REACHED");
        });

        it("Should fail if transaction is already executed", async function () {
            const executionData = "0x1234";
            await transactionManager.connect(arbitrator).executeTransaction(txHash, executionData);
            await time.increase(3601);

            await expect(
                transactionManager.connect(dapp).cancelTransaction(txHash)
            ).to.be.revertedWithCustomError(transactionManager, "INVALID_TRANSACTION_STATUS");
        });

        it("Should fail if caller is not the original DApp", async function () {
            await time.increase(3601);

            await expect(
                transactionManager.connect(other).cancelTransaction(txHash)
            ).to.be.revertedWithCustomError(transactionManager, "NOT_AUTHORIZED_DAPP");
        });
    });

    describe("Transaction Completion", function () {
        let transactionId;
        const duration = BigInt(30 * 24 * 60 * 60);

        beforeEach(async function () {
            const expectedFee = (STAKE_AMOUNT * duration * BigInt(FEE_RATE)) / (BigInt(SECONDS_PER_YEAR) * BigInt(FEE_RATE_MULTIPLIER));
            const tx = await transactionManager.connect(dapp).registerTransaction(
                arbitrator.address,
                Number(duration),
                { value: expectedFee }
            );
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => 
                log.fragment && log.fragment.name === 'TransactionRegistered'
            );
            transactionId = event.args.transactionId;
        });

        it("Should complete transaction with correct fee calculation", async function () {
            await transactionManager.connect(arbitrator).completeTransaction(transactionId);
            
            const transaction = await transactionManager.getTransaction(transactionId);
            expect(transaction.status).to.equal(2); // Completed status
        });

        it("Should fail to complete if not arbitrator", async function () {
            await expect(
                transactionManager.connect(other).completeTransaction(transactionId)
            ).to.be.revertedWithCustomError(transactionManager, "NOT_ARBITRATOR");
        });

        it("Should fail to complete if already completed", async function () {
            await transactionManager.connect(arbitrator).completeTransaction(transactionId);
            await expect(
                transactionManager.connect(arbitrator).completeTransaction(transactionId)
            ).to.be.revertedWithCustomError(transactionManager, "INVALID_TRANSACTION_STATUS");
        });
    });

    describe("Arbitration", function () {
        let transactionId;
        const duration = BigInt(30 * 24 * 60 * 60);

        beforeEach(async function () {
            const expectedFee = (STAKE_AMOUNT * duration * BigInt(FEE_RATE)) / (BigInt(SECONDS_PER_YEAR) * BigInt(FEE_RATE_MULTIPLIER));
            const tx = await transactionManager.connect(dapp).registerTransaction(
                arbitrator.address,
                Number(duration),
                { value: expectedFee }
            );
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => 
                log.fragment && log.fragment.name === 'TransactionRegistered'
            );
            transactionId = event.args.transactionId;
        });

        it("Should request arbitration", async function () {
            await transactionManager.connect(dapp).requestArbitration(transactionId);
            
            const transaction = await transactionManager.getTransaction(transactionId);
            expect(transaction.status).to.equal(1); // Arbitration status
        });

        it("Should fail to request arbitration if not DApp", async function () {
            await expect(
                transactionManager.connect(other).requestArbitration(transactionId)
            ).to.be.revertedWithCustomError(transactionManager, "NOT_REGISTERED_DAPP");
        });

        it("Should fail to request arbitration if already in arbitration", async function () {
            await transactionManager.connect(dapp).requestArbitration(transactionId);
            await expect(
                transactionManager.connect(dapp).requestArbitration(transactionId)
            ).to.be.revertedWithCustomError(transactionManager, "INVALID_TRANSACTION_STATUS");
        });
    });

    describe("Contract Interactions", function () {
        let txHash;
        let amount;
        let deadline;
        const executionData = "0x1234";

        beforeEach(async function () {
            txHash = ethers.id("test");
            amount = ethers.parseEther("1");
            deadline = await time.latest() + 3600;

            // Register transaction
            await transactionManager.connect(dapp).registerTransaction(
                txHash,
                amount,
                deadline,
                arbitrator.address
            );
        });

        describe("Interaction with ArbitratorManager", function () {
            it("Should update arbitrator's active transaction count", async function () {
                // Get initial state
                const initialInfo = await arbitratorManager.getArbitratorInfo(arbitrator.address);
                const initialCount = initialInfo.activeTransactionCount;

                // Execute transaction
                await transactionManager.connect(arbitrator).executeTransaction(txHash, executionData);

                // Check updated state
                const finalInfo = await arbitratorManager.getArbitratorInfo(arbitrator.address);
                expect(finalInfo.activeTransactionCount).to.equal(initialCount.add(1));
            });

            it("Should fail if arbitrator is suspended", async function () {
                // Suspend arbitrator
                await arbitratorManager.connect(owner).suspendArbitrator(arbitrator.address);

                // Try to execute transaction
                await expect(
                    transactionManager.connect(arbitrator).executeTransaction(txHash, executionData)
                ).to.be.revertedWithCustomError(transactionManager, "ARBITRATOR_SUSPENDED");
            });

            it("Should handle arbitrator stake changes correctly", async function () {
                // Arbitrator increases stake
                const additionalStake = ethers.parseEther("50");
                await arbitratorManager.connect(arbitrator).stakeETH({ value: additionalStake });

                // Execute transaction
                await transactionManager.connect(arbitrator).executeTransaction(txHash, executionData);

                // Verify transaction execution was successful
                const tx = await transactionManager.getTransaction(txHash);
                expect(tx.status).to.equal(1); // EXECUTED
            });
        });

        describe("Interaction with CompensationManager", function () {
            const compensationAmount = ethers.parseEther("0.5");
            const compensationReason = "Delayed execution";

            beforeEach(async function () {
                // Execute transaction first
                await transactionManager.connect(arbitrator).executeTransaction(txHash, executionData);
            });

            it("Should allow compensation request after execution", async function () {
                // Request compensation
                await expect(
                    transactionManager.connect(dapp).requestCompensation(
                        txHash,
                        compensationAmount,
                        compensationReason
                    )
                ).to.emit(compensationManager, "CompensationRequested")
                 .withArgs(txHash, dapp.address, arbitrator.address, compensationAmount);

                // Verify compensation request state
                const request = await compensationManager.getCompensationRequest(txHash);
                expect(request.amount).to.equal(compensationAmount);
                expect(request.reason).to.equal(compensationReason);
            });

            it("Should fail compensation request if transaction not executed", async function () {
                const newTxHash = ethers.id("newTest");
                await transactionManager.connect(dapp).registerTransaction(
                    newTxHash,
                    amount,
                    deadline,
                    arbitrator.address
                );

                await expect(
                    transactionManager.connect(dapp).requestCompensation(
                        newTxHash,
                        compensationAmount,
                        compensationReason
                    )
                ).to.be.revertedWithCustomError(transactionManager, "TRANSACTION_NOT_EXECUTED");
            });

            it("Should handle compensation payment correctly", async function () {
                // Request compensation
                await transactionManager.connect(dapp).requestCompensation(
                    txHash,
                    compensationAmount,
                    compensationReason
                );

                // Get initial balances
                const initialDAppBalance = await ethers.provider.getBalance(dapp.address);
                const initialArbitratorBalance = await ethers.provider.getBalance(arbitrator.address);

                // Approve compensation
                await compensationManager.connect(arbitrator).approveCompensation(txHash);

                // Verify balances after compensation
                const finalDAppBalance = await ethers.provider.getBalance(dapp.address);
                const finalArbitratorBalance = await ethers.provider.getBalance(arbitrator.address);

                expect(finalDAppBalance).to.equal(initialDAppBalance.add(compensationAmount));
                expect(finalArbitratorBalance).to.be.lt(initialArbitratorBalance);
            });

            it("Should update arbitrator reputation after compensation", async function () {
                // Request and approve compensation
                await transactionManager.connect(dapp).requestCompensation(
                    txHash,
                    compensationAmount,
                    compensationReason
                );
                await compensationManager.connect(arbitrator).approveCompensation(txHash);

                // Check arbitrator reputation update
                const arbitratorInfo = await arbitratorManager.getArbitratorInfo(arbitrator.address);
                expect(arbitratorInfo.compensationCount).to.be.gt(0);
            });
        });

        describe("Cross-contract State Consistency", function () {
            it("Should maintain consistent state across all contracts after execution", async function () {
                // Execute transaction
                await transactionManager.connect(arbitrator).executeTransaction(txHash, executionData);

                // Verify TransactionManager state
                const tx = await transactionManager.getTransaction(txHash);
                expect(tx.status).to.equal(1); // EXECUTED

                // Verify ArbitratorManager state
                const arbitratorInfo = await arbitratorManager.getArbitratorInfo(arbitrator.address);
                expect(arbitratorInfo.activeTransactionCount).to.be.gt(0);

                // Verify CompensationManager state
                const canRequestCompensation = await compensationManager.canRequestCompensation(txHash);
                expect(canRequestCompensation).to.be.true;
            });

            it("Should handle complex interaction flow", async function () {
                // 1. Execute transaction
                await transactionManager.connect(arbitrator).executeTransaction(txHash, executionData);

                // 2. Request compensation
                await transactionManager.connect(dapp).requestCompensation(
                    txHash,
                    compensationAmount,
                    compensationReason
                );

                // 3. Approve compensation
                await compensationManager.connect(arbitrator).approveCompensation(txHash);

                // 4. Verify final states across all contracts
                const tx = await transactionManager.getTransaction(txHash);
                expect(tx.status).to.equal(1); // EXECUTED

                const arbitratorInfo = await arbitratorManager.getArbitratorInfo(arbitrator.address);
                expect(arbitratorInfo.compensationCount).to.be.gt(0);

                const compensationRequest = await compensationManager.getCompensationRequest(txHash);
                expect(compensationRequest.status).to.equal(1); // APPROVED
            });
        });
    });
});
