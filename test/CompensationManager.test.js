const { expect } = require("chai");
const { ethers } = require("hardhat");
const { upgrades } = require("hardhat");
const {sleep} = require("../scripts/helper");

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
    let user1;
    let compensationReceiver;
    let timeoutReceiver;
    let transactionId;
    const duration = 30 * 24 * 60 * 60; // 30days

    const VALID_BTC_TX = "0x0200000000010153d6c3d859dfa233045771e55cea4e14b409c1393fa4917fb64f364b69ddf8fd00000000000000000001ec280000000000001976a9143d9ec353ad9df31924ffdb63027af35f135a4ae088ac054730440220287e9e41c54b48c30e46ea442aa80ab793dac56d3816dbb2a5ea465f0c6e26e1022079aed874e9774b23c98ad9a60b38f37918591d50af83f49b92e63b9ce74fdedf014730440220724b11c130ca4f290b8b09276b1d7c80248dfb8b0a9457843d3def3215998bb802202a7363e6dcd6025aba032859bc137e20c598cdca0cd90b22d4101e0c24b5b94901010100fd0a01632103cb0ee3eb3e9cdfdfdd6a5b276f7e480153caa491c590f8ac4a15dbde0442e6eaad2102005ec91740e2a7d8c06060a0ff7777630767d296160dc502e56eb2b6bb83d8a7ac67632103cb0ee3eb3e9cdfdfdd6a5b276f7e480153caa491c590f8ac4a15dbde0442e6eaad2102b1a82d3c01657ffa2b2b3433896386ac3fcad4cd04cffc74a90cba4c4bd8addeac676303ab0440b2752102005ec91740e2a7d8c06060a0ff7777630767d296160dc502e56eb2b6bb83d8a7ada8205a0737e8cbcfa24dcc118b0ab1e6d98bee17c57daa8a1686024159aae707ed6f876703b20440b2752103cb0ee3eb3e9cdfdfdd6a5b276f7e480153caa491c590f8ac4a15dbde0442e6eaac68686800000000";
    const VALID_SIGNATURE = "0x30440220287e9e41c54b48c30e46ea442aa80ab793dac56d3816dbb2a5ea465f0c6e26e1022079aed874e9774b23c98ad9a60b38f37918591d50af83f49b92e63b9ce74fdedf01";
    const VALID_TX_HASH = "0x5a521d5d7e40351fe68dd12c84a84ea67aacbedd88894c1a518429d43e05b905";
    const VALID_PUB_KEY = "0x02b1a82d3c01657ffa2b2b3433896386ac3fcad4cd04cffc74a90cba4c4bd8adde";
    const VALID_UTXOS = [{
        txHash: "0xfdf8dd694b364fb67f91a43f39c109b4144eea5ce571570433a2df59d8c3d653",
        index: 0,
        script: "0x0020d473100bd1a04e1ea90ad3e5411e6b4b75ca5d96b57781fc09bc79f135b24531",
        amount: 10816
    }];
    const VALID_EVIDENCE = "0xa8a0b55bd00df1287445685c7c4a7e0a3df8edd82fee186cfcfda436f2924cea";
    const STAKE_AMOUNT = ethers.utils.parseEther("1.0");

    beforeEach(async function () {
        [owner, dapp, arbitrator, user, user1, compensationReceiver, timeoutReceiver] = await ethers.getSigners();

        // Deploy mock contracts
        const MockZkService = await ethers.getContractFactory("MockZkService");
        const MockNFT = await ethers.getContractFactory("MockNFT");
        const MockNFTInfo = await ethers.getContractFactory("MockNFTInfo");
        const ConfigManager = await ethers.getContractFactory("ConfigManager");
        const DappRegistry = await ethers.getContractFactory("DAppRegistry");
        const ArbitratorManager = await ethers.getContractFactory("ArbitratorManager");
        const TransactionManager = await ethers.getContractFactory("TransactionManager");
        const CompensationManager = await ethers.getContractFactory("CompensationManager");

        // Deploy contracts
        zkService = await MockZkService.deploy();
        mockNFT = await MockNFT.deploy();
        mockNFTInfo = await MockNFTInfo.deploy();
        configManager = await upgrades.deployProxy(ConfigManager, [], { initializer: 'initialize' });
        dappRegistry = await upgrades.deployProxy(DappRegistry, [configManager.address], { initializer: 'initialize' });
        arbitratorManager = await upgrades.deployProxy(ArbitratorManager, [
            configManager.address,
            mockNFT.address,
            mockNFTInfo.address
        ], { initializer: 'initialize' });

        compensationManager = await upgrades.deployProxy(CompensationManager, [
            zkService.address,
            configManager.address,
            arbitratorManager.address
        ], { initializer: 'initialize' });

        transactionManager = await upgrades.deployProxy(TransactionManager, [
            arbitratorManager.address,
            dappRegistry.address,
            configManager.address,
            compensationManager.address
        ], { initializer: 'initialize' });

        // Set transactionManager
        await compensationManager.connect(owner).setTransactionManager(transactionManager.address);

        // Initialize contracts
        await arbitratorManager.initTransactionAndCompensationManager(transactionManager.address, compensationManager.address);
        // Register dapp and arbitrator
        await dappRegistry.connect(owner).registerDApp(
            dapp.address,
            {value: ethers.utils.parseEther("10")}
        );

        await dappRegistry.connect(owner).authorizeDApp(
            dapp.address,
        );

        const btcAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
        const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 356 days from now
        const feeRate = 1000; // 10%
        let tx = await arbitratorManager.connect(arbitrator).registerArbitratorByStakeETH(
            btcAddress,
            VALID_PUB_KEY,
            feeRate,
            deadline,
            { value: STAKE_AMOUNT }
        );
        await tx.wait();

        // Correctly register transaction using registerTransaction
        const txData = {
            sender: owner.address,
            recipient: user1.address,
            amount: ethers.utils.parseEther("1"),
        };

        const registerTx = await transactionManager.connect(dapp).registerTransaction(
            arbitrator.address,
            Math.floor(Date.now() / 1000) + duration, // 30 days from now
            compensationReceiver.address,
            { value: ethers.utils.parseEther("0.1") }
        );
        const receipt = await registerTx.wait();
        const event = receipt.events.find(e => e.event === "TransactionRegistered");
        transactionId = event.args[0];
        await transactionManager.connect(dapp).uploadUTXOs(transactionId, VALID_UTXOS);
    });

    describe("claimIllegalSignatureCompensation", function () {
        it("should succeed with valid verification data", async function () {
            await zkService.setValidVerification(
                VALID_EVIDENCE,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                VALID_UTXOS
            );

            let verification = await zkService.getZkVerification(VALID_EVIDENCE);
            expect(verification.pubKey).to.equal(VALID_PUB_KEY);
            expect(verification.txHash).to.equal(VALID_TX_HASH);
            expect(verification.signature).to.equal(VALID_SIGNATURE);
            expect(verification.verified).to.be.true;

            // Claim compensation
            const claimTx = await compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                arbitrator.address,
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            );
            
            // Verify events and claim details
            const receipt = await claimTx.wait();
            const claimEvent = receipt.events.find(e => e.event === 'CompensationClaimed');
            expect(claimEvent).to.exist;
            expect(claimEvent.args[7]).to.equal(0); // IllegalSignature type

            expect(await arbitratorManager.getAvailableStake(arbitrator.address)).to.equal(0);

            const transaction = await transactionManager.getTransactionById(transactionId);
            expect(transaction.status).to.equal(1);

            const claimId = ethers.utils.solidityKeccak256(
                ["bytes32", "address", "address", "uint8"],
                [VALID_EVIDENCE, arbitrator.address, compensationReceiver.address, 0]
              );
            const compensationClaim = await compensationManager.claims(claimId);
            expect(compensationClaim.claimer).to.equal(dapp.address);
            expect(compensationClaim.arbitrator).to.equal(arbitrator.address);
            expect(compensationClaim.claimType).to.equal(0);
            expect(compensationClaim.withdrawn).to.equal(false);
            expect(compensationClaim.ethAmount).to.equal(STAKE_AMOUNT);
            expect(compensationClaim.totalAmount).to.equal(STAKE_AMOUNT);
            expect(compensationClaim.receivedCompensationAddress).to.equal(compensationReceiver.address);
        });

        it("should revert with invalid utxos", async function () {
            await zkService.setValidVerification(
                VALID_EVIDENCE,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                []
            );

            await expect(compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                arbitrator.address,
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.be.revertedWith("U0");
        });

        it("should revert with public key mismatch", async function () {
            const pubkey = "0x03cb0ee3eb3e9cdfdfdd6a5b276f7e480153caa491c590f8ac4a15dbde0442e6ea";
            await zkService.setValidVerification(
                VALID_EVIDENCE,
                pubkey,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                VALID_UTXOS
            );
            await expect(compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                arbitrator.address,
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.be.revertedWith("M7");
        });

        it("should revert with no active transaction", async function () {
            await transactionManager.connect(dapp).requestArbitration(
                transactionId,
                VALID_BTC_TX,
                "0xab2348",
                user.address
            );

            await transactionManager.connect(arbitrator).submitArbitration(
                transactionId,
                VALID_SIGNATURE);

            await zkService.setValidVerification(
                VALID_EVIDENCE,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                VALID_UTXOS
            );

            await expect(compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                arbitrator.address,
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.be.revertedWith("M8");
        });

        it("should revert with zk proof failed ", async function () {
            await zkService.setInvalidVerification(
                VALID_EVIDENCE,
                1,
                "0x",
                VALID_TX_HASH,
                VALID_SIGNATURE,
                []
            );

            await expect(compensationManager.connect(dapp).claimIllegalSignatureCompensation(
                arbitrator.address,
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.be.revertedWith("M6");
        });
    });
    describe("claimFailedArbitrationCompensation", function () {
        beforeEach(async function () {
            await transactionManager.connect(dapp).requestArbitration(
                transactionId,
                VALID_BTC_TX,
                "0xab2348",
                timeoutReceiver.address
            );
        });

        it("should succeed with invalid verification data", async function () {
            await zkService.setInvalidVerification(
                VALID_EVIDENCE,
                0,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                VALID_UTXOS
            );
            await transactionManager.connect(arbitrator).submitArbitration(
                transactionId,
                VALID_SIGNATURE);

            const claimId = ethers.utils.solidityKeccak256(
                ["bytes32", "address", "address", "uint8"],
                [VALID_EVIDENCE, arbitrator.address, compensationReceiver.address, 2]
              );

            await expect(compensationManager.connect(dapp).claimFailedArbitrationCompensation(
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.emit(compensationManager, "CompensationClaimed").withArgs(
                claimId,
                dapp.address,
                arbitrator.address,
                STAKE_AMOUNT,
                [],
                STAKE_AMOUNT,
                compensationReceiver.address,
                2
            );

            expect(await arbitratorManager.getAvailableStake(arbitrator.address)).to.equal(0);

            const transaction = await transactionManager.getTransactionById(transactionId);
            expect(transaction.status).to.equal(1);

            const compensationClaim = await compensationManager.claims(claimId);
            expect(compensationClaim.claimer).to.equal(dapp.address);
            expect(compensationClaim.arbitrator).to.equal(arbitrator.address);
            expect(compensationClaim.claimType).to.equal(2);
            expect(compensationClaim.withdrawn).to.equal(false);
            expect(compensationClaim.ethAmount).to.equal(STAKE_AMOUNT);
            expect(compensationClaim.totalAmount).to.equal(STAKE_AMOUNT);
            expect(compensationClaim.receivedCompensationAddress).to.equal(compensationReceiver.address);
        });

        it("should revert with zk proof failed", async function () {
            await zkService.setInvalidVerification(
                VALID_EVIDENCE,
                1,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                VALID_UTXOS
            );
            await expect(compensationManager.connect(dapp).claimFailedArbitrationCompensation(
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.be.revertedWith("M6");
        });

        it("should revert with signature not submitted", async function () {
            await zkService.setInvalidVerification(
                VALID_EVIDENCE,
                0,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                VALID_UTXOS
            );
            await expect(compensationManager.connect(dapp).claimFailedArbitrationCompensation(
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.be.revertedWith("S5");
        });

        it("should revert with signature mismatch", async function () {
            const signature = "0x30440220785b0fafc9a705952850455098820dd16eb1401c8cb4c743a836414679eeaeef022059e625a5cbb5f5508c30b1764c4d11a2b1d7d6676250a33da77b2c48a52eb1e901";
            await transactionManager.connect(arbitrator).submitArbitration(
                transactionId,
                signature);

            await zkService.setInvalidVerification(
                VALID_EVIDENCE,
                0,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                VALID_UTXOS
            );
            await expect(compensationManager.connect(dapp).claimFailedArbitrationCompensation(
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.be.revertedWith("S6");
        });

        it("should revert with public key mismatch", async function () {
            const pubkey = "0x03cb0ee3eb3e9cdfdfdd6a5b276f7e480153caa491c590f8ac4a15dbde0442e6ea";
            await transactionManager.connect(arbitrator).submitArbitration(
                transactionId,
                VALID_SIGNATURE);

            await zkService.setInvalidVerification(
                VALID_EVIDENCE,
                0,
                pubkey,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                VALID_UTXOS
            );
            await expect(compensationManager.connect(dapp).claimFailedArbitrationCompensation(
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.be.revertedWith("M7");
        });

        it("should revert with invalid utxos", async function () {
            await transactionManager.connect(arbitrator).submitArbitration(
                transactionId,
                VALID_SIGNATURE);

            const utxos = [{
                txHash: "0xfdf8dd694b364fb67f91a43f39c109b4144eea5ce571570433a2df59d8c3d653",
                index: 0,
                script: "0x0020d473100bd1a04e1ea90ad3e5411e6b4b75ca5d96b57781fc09bc79f135b24531",
                amount: 10000
            }];

            await zkService.setInvalidVerification(
                VALID_EVIDENCE,
                0,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                utxos
            );
            await expect(compensationManager.connect(dapp).claimFailedArbitrationCompensation(
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            )).to.be.revertedWith("U0");
        });
    });

    describe("claimTimeoutCompensation", function () {
        let claimId;
        beforeEach(async function () {
            await transactionManager.connect(dapp).requestArbitration(
                transactionId,
                VALID_BTC_TX,
                "0xab2348",
                timeoutReceiver.address
            );

            claimId = ethers.utils.solidityKeccak256(
                ["bytes32", "address", "address", "uint8"],
                [transactionId, arbitrator.address, timeoutReceiver.address, 1]
              );
        });
        it("should scceed after timeout", async function () {
            const configTime = await configManager.getArbitrationTimeout();
            await network.provider.send("evm_increaseTime", [configTime.toNumber()]);
            await network.provider.send("evm_mine");

            await expect(compensationManager.connect(dapp).claimTimeoutCompensation(
                transactionId)).to.emit(compensationManager, "CompensationClaimed")
                .withArgs(
                    claimId,
                    dapp.address,
                    arbitrator.address,
                    STAKE_AMOUNT,
                    [],
                    STAKE_AMOUNT,
                    timeoutReceiver.address,
                    1);

            expect(await arbitratorManager.getAvailableStake(arbitrator.address)).to.equal(0);

            const transaction = await transactionManager.getTransactionById(transactionId);
            expect(transaction.status).to.equal(1);

            const compensationClaim = await compensationManager.claims(claimId);
            expect(compensationClaim.claimer).to.equal(dapp.address);
            expect(compensationClaim.arbitrator).to.equal(arbitrator.address);
            expect(compensationClaim.claimType).to.equal(1);
            expect(compensationClaim.withdrawn).to.equal(false);
            expect(compensationClaim.ethAmount).to.equal(STAKE_AMOUNT);
            expect(compensationClaim.totalAmount).to.equal(STAKE_AMOUNT);
            expect(compensationClaim.receivedCompensationAddress).to.equal(timeoutReceiver.address);
        });

        it("should revert with not timeout", async function () {
            await network.provider.send("evm_increaseTime", [1000]);
            await network.provider.send("evm_mine");

            await expect(compensationManager.connect(dapp).claimTimeoutCompensation(
                transactionId)).to.be.revertedWith("M3");
        });

        it("should revert with already claimed", async function () {
            const configTime = await configManager.getArbitrationTimeout();
            await network.provider.send("evm_increaseTime", [configTime.toNumber()]);
            await network.provider.send("evm_mine");

            await compensationManager.connect(dapp).claimTimeoutCompensation(transactionId)
            await expect(compensationManager.connect(dapp).claimTimeoutCompensation(
                transactionId)).to.be.revertedWith("M9");
        });
        it("should revert with not in arbitration", async function () {
            await transactionManager.connect(arbitrator).submitArbitration(transactionId, VALID_SIGNATURE);
            await expect(compensationManager.connect(dapp).claimTimeoutCompensation(
                transactionId)).to.be.revertedWith("M2");
        });
    });

    describe("withdrawCompensation", function () {
        let claimId;
        let withdrawFee;
        beforeEach(async function () {
            await transactionManager.connect(dapp).requestArbitration(
                transactionId,
                VALID_BTC_TX,
                "0xab2348",
                timeoutReceiver.address
            );
            await zkService.setInvalidVerification(
                VALID_EVIDENCE,
                0,
                VALID_PUB_KEY,
                VALID_TX_HASH,
                VALID_SIGNATURE,
                VALID_UTXOS
            );
            await transactionManager.connect(arbitrator).submitArbitration(
                transactionId,
                VALID_SIGNATURE);
            await compensationManager.connect(dapp).claimFailedArbitrationCompensation(
                VALID_BTC_TX,  // Pass the BTC transaction
                VALID_EVIDENCE
            );
            claimId = ethers.utils.solidityKeccak256(
                ["bytes32", "address", "address", "uint8"],
                [VALID_EVIDENCE, arbitrator.address, compensationReceiver.address, 2]
              );
            const feeRate = await configManager.getSystemCompensationFeeRate();
            withdrawFee = STAKE_AMOUNT.mul(feeRate).div(10000);
        });

        it("should withdraw successfully", async function () {
            await expect(compensationManager.connect(compensationReceiver).withdrawCompensation(claimId, {value: withdrawFee}))
                .to.emit(compensationManager, "CompensationWithdrawn").withArgs(
                    claimId,
                    compensationReceiver.address,
                    compensationReceiver.address,
                    STAKE_AMOUNT,
                    [],
                    withdrawFee,
                    0
                );
        });

        it("should withdraw successfully with correct amount", async function () {
            const balanceBefore = await ethers.provider.getBalance(compensationReceiver.address);

            const tx = await compensationManager.connect(compensationReceiver).withdrawCompensation(claimId, {value: withdrawFee});
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed;
            const gasPrice = receipt.effectiveGasPrice;
            const txFee = gasUsed.mul(gasPrice);

            const balanceAfter = await ethers.provider.getBalance(compensationReceiver.address);
            expect(balanceAfter.sub(balanceBefore)).to.equal(STAKE_AMOUNT.sub(withdrawFee).sub(txFee));
        });

        it("should withdraw successfully by other account with correct amount", async function () {
            const balanceBefore = await ethers.provider.getBalance(compensationReceiver.address);

            await compensationManager.connect(owner).withdrawCompensation(claimId, {value: withdrawFee});

            const balanceAfter = await ethers.provider.getBalance(compensationReceiver.address);
            expect(balanceAfter.sub(balanceBefore)).to.equal(STAKE_AMOUNT);
        });

        it("should revert with withdrawn", async function () {
            await compensationManager.connect(compensationReceiver).withdrawCompensation(claimId, {value: withdrawFee});
            await expect(compensationManager.connect(compensationReceiver).withdrawCompensation(claimId, {value: withdrawFee}))
                .to.be.revertedWith("M4");
        });
    });

    describe("claimArbitratorFee", function () {
        let claimId;
        beforeEach(async function () {
            await transactionManager.connect(dapp).requestArbitration(
                transactionId,
                VALID_BTC_TX,
                "0xab2348",
                timeoutReceiver.address
            );

            claimId = ethers.utils.solidityKeccak256(
                ["bytes32", "address", "address", "uint8"],
                [transactionId, arbitrator.address, arbitrator.address, 3]);
        });
        it("should claim successfully", async function () {
            await transactionManager.connect(arbitrator).submitArbitration(
                transactionId,
                VALID_SIGNATURE);

            const frozen = await configManager.getArbitrationFrozenPeriod();
            await network.provider.send("evm_increaseTime", [frozen.toNumber()]);
            await network.provider.send("evm_mine");

            await expect(compensationManager.connect(arbitrator).claimArbitratorFee(transactionId))
                .to.emit(compensationManager, "CompensationClaimed");

            const compensationClaim = await compensationManager.claims(claimId);
            expect(compensationClaim.claimer).to.equal(arbitrator.address);
            expect(compensationClaim.arbitrator).to.equal(arbitrator.address);
            expect(compensationClaim.claimType).to.equal(3);
            expect(compensationClaim.withdrawn).to.equal(true);
            expect(compensationClaim.receivedCompensationAddress).to.equal(arbitrator.address);

            const transaction = await transactionManager.getTransactionById(transactionId);
            expect(transaction.status).to.equal(1);

            expect(await arbitratorManager.isActiveArbitrator(arbitrator.address)).to.equal(true);
        });
        it("should revert with not tx arbitrator", async function () {
            await expect(compensationManager.connect(dapp).claimArbitratorFee(transactionId))
                .to.be.revertedWith("M1");
        });
        it("should revert with invalid tx status", async function () {
            await expect(compensationManager.connect(arbitrator).claimArbitratorFee(transactionId))
                .to.be.revertedWith("T2");
        });
        it("should revert because of frozen", async function () {
            await transactionManager.connect(arbitrator).submitArbitration(
                transactionId,
                VALID_SIGNATURE);

            await expect(compensationManager.connect(arbitrator).claimArbitratorFee(transactionId))
                .to.be.revertedWith("T2");
        });
        it("should revert because of arbitrated but not submitted", async function () {
            await expect(compensationManager.connect(arbitrator).claimArbitratorFee(transactionId))
                .to.be.revertedWith("T2");
        });
    });
    describe("claimArbitratorFee Active transaction", function () {
        it("should revert because of active tx not expired", async function () {
            await expect(compensationManager.connect(arbitrator).claimArbitratorFee(transactionId))
                .to.be.revertedWith("T2");
        });
        it("should claim successfully", async function () {
            await network.provider.send("evm_increaseTime", [duration]);
            await network.provider.send("evm_mine");

            await expect(compensationManager.connect(arbitrator).claimArbitratorFee(transactionId))
                .to.emit(compensationManager, "CompensationClaimed");

            let claimId = ethers.utils.solidityKeccak256(
                ["bytes32", "address", "address", "uint8"],
                [transactionId, arbitrator.address, arbitrator.address, 3]);
            const compensationClaim = await compensationManager.claims(claimId);
            expect(compensationClaim.claimer).to.equal(arbitrator.address);
            expect(compensationClaim.arbitrator).to.equal(arbitrator.address);
            expect(compensationClaim.claimType).to.equal(3);
            expect(compensationClaim.withdrawn).to.equal(true);
            expect(compensationClaim.receivedCompensationAddress).to.equal(arbitrator.address);

            const transaction = await transactionManager.getTransactionById(transactionId);
            expect(transaction.status).to.equal(1);

            expect(await arbitratorManager.isActiveArbitrator(arbitrator.address)).to.equal(true);
        });
    });
});
