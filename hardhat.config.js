require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-deploy");
require("dotenv").config();

const { staging_key, prod_key } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    prod: {
      url: "https://api.elastos.io/esc",
      accounts: [...(prod_key ? [prod_key] : [])]
    },
    stage: {
      url: "https://api.elastos.io/esc",
      accounts: [...(staging_key ? [staging_key] : [])]
    },
    testnet: {
      url: "https://api-testnet.elastos.io/esc",
      accounts: [...(staging_key ? [staging_key] : [])]
    },
    hardhat: {
      chainId: 100,
      accounts: [
        ...(staging_key ? [{ privateKey: staging_key, balance: "10000000000000000000000" }] : []),
      ],
      blockGasLimit: 8000000
    }
  }
};
