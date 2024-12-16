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


        const nftAddress = await readConfig(network.name, "ERC721_ADDRESS");
        console.log("nftAddress:", nftAddress);

        const nftInfoAddress = await readConfig(network.name, "BNFT_INFO");
        console.log("nftInfoAddress:", nftInfoAddress);

        console.log("\nDeploying ArbitratorManager...");
        const ArbitratorManager = await ethers.getContractFactory("ArbitratorManager");
        const arbitratorManager = await ArbitratorManager.deploy(
            configManagerAddress,
            deployer.address,
            nftAddress,
            nftInfoAddress,
            { gasLimit: 3000000 }
        );
        
        await arbitratorManager.waitForDeployment();
        const contractAddress = await arbitratorManager.getAddress();
        console.log("ArbitratorManager deployed to:", contractAddress);
        
        // Save all contract addresses
        await writeConfig(network.name, "ARBITRATOR_MANAGER", contractAddress);
        
        console.log("\nDeployment completed successfully!");
        
    } catch (error) {
        console.error("Deployment failed!", error);
        process.exitCode = 1;
    }
}

main();
