require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'cancun',
      viaIR: true,
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,   
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 120000,
      gasMultiplier: 1.2,
    },
  },
  etherscan: {
    apiKey: { sepolia: process.env.ETHERSCAN_API_KEY || '' },
  },
}

console.log('RPC URL:', process.env.SEPOLIA_RPC_URL)