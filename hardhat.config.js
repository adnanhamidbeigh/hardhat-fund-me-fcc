// require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy-ethers");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomicfoundation/hardhat-chai-matchers");
// require("ethereum-waffle");
// require("@nomicfoundation/hardhat-chai-matchers")
// require("@nomiclabs/hardhat-waffle")

/** @type import('hardhat/config').HardhatUserConfig */
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY= process.env.COINMARKETCAP_API_KEY;

module.exports = {
    defaultNetwork: "hardhat",
    // solidity: "0.8.8",
    solidity: {
        compilers: [{version: "0.8.8"}, {version: "0.6.6"}]
    },
    namedAccounts: {
        deployer: {
            default: 0
        },
        users: {
            default: 1
        }
    },
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY], // it should be accounts not account!
            chainId: 11155111,
            blockConfirmations: 6
        },
        localHost: {
            url: "http://127.0.0.1:8545/",
            // accounts: 
            chainId: 31337,
        }
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH"
    },
};
