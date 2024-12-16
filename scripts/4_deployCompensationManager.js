const { ethers, network, getChainId } = require("hardhat");
const { sleep, writeConfig, readConfig } = require("./helper.js");

async function main() {
    try {
        console.log("Starting deployment...");
        const chainID = await getChainId();
        console.log("Deploying to chain ID:", chainID);
        
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with account:", deployer.address);
        console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

        // Get required contract addresses from previous deployments
        const zkServiceAddress = await readConfig(network.name, "ZK_SERVICE");
        if (!zkServiceAddress) {
            throw new Error("ZkService address not found.");
        }
        console.log("Using ZkService at:", zkServiceAddress);

        const configManagerAddress = await readConfig(network.name, "CONFIG_MANAGER");
        if (!configManagerAddress) {
            throw new Error("ConfigManager address not found.");
        }
        console.log("Using ConfigManager at:", configManagerAddress);

        const arbitratorManagerAddress = await readConfig(network.name, "ARBITRATOR_MANAGER");
        if (!arbitratorManagerAddress) {
            throw new Error("ArbitratorManager address not found.");
        }
        console.log("Using ArbitratorManager at:", arbitratorManagerAddress);

        const transactionManagerAddress = await readConfig(network.name, "TRANSACTION_MANAGER");
        if (!transactionManagerAddress) {
            throw new Error("TransactionManager address not found.");
        }
        console.log("Using TransactionManager at:", transactionManagerAddress);

        console.log("\nDeploying CompensationManager...");
        const CompensationManager = await ethers.getContractFactory("CompensationManager");
        const compensationManager = await CompensationManager.deploy(
            zkServiceAddress,
            transactionManagerAddress,
            configManagerAddress,
            arbitratorManagerAddress,
            { gasLimit: 5000000 } 
        );
        
        await compensationManager.waitForDeployment();
        const contractAddress = await compensationManager.getAddress();
        console.log("CompensationManager deployed to:", contractAddress);
        
        // Save the contract address
        await writeConfig(network.name, "COMPENSATION_MANAGER", contractAddress);
        
        console.log("\nDeployment completed successfully!");
        
    } catch (error) {
        console.error("Deployment failed!", error);
        process.exitCode = 1;
    }
}

main();
