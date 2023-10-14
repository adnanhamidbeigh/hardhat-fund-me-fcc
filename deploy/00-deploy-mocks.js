const { network } = require("hardhat");
const { developmentChains, decimals, initialAnswer } = require("../helper-hardhat-config");

const DECIMALS = decimals;
const INITIAL_ANSWER = initialAnswer

module.exports = async ({ getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); // await getNamedAccounts()
    const chainId = network.config.chainId;
    

    if (chainId == 31337){
        log("Local Network Detected! \nDeploying mocks ....")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });

        log("Voilà Mocks Deployed")
        log("---------------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]