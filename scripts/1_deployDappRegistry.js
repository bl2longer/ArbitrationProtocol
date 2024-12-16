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

        // Get ConfigManager address from previous deployment
        const configManagerAddress = await readConfig(network.name, "CONFIG_MANAGER");
        if (!configManagerAddress) {
            throw new Error("ConfigManager address not found. Please deploy ConfigManager first.");
        }
        console.log("Using ConfigManager at:", configManagerAddress);

        console.log("\nDeploying DAppRegistry...");
        const DAppRegistry = await ethers.getContractFactory("DAppRegistry");
        const dappRegistry = await DAppRegistry.deploy(
            configManagerAddress,
            deployer.address,
            { gasLimit: 3000000 }
        );
        
        await dappRegistry.waitForDeployment();
        const contractAddress = await dappRegistry.getAddress();
        console.log("DAppRegistry deployed to:", contractAddress);
        
        // Save the contract address
        await writeConfig(network.name, "DAPP_REGISTRY", contractAddress);
        
        console.log("\nDeployment completed successfully!");
        
    } catch (error) {
        console.error("Deployment failed!", error);
        process.exitCode = 1;
    }
}

main();