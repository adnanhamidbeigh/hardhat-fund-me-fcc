// function deployFunc(){
//     console.log("Hi")
// }

const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();
// module.exports.default = deployFunc;


// module.exports = async (hre)=>{
//     const {getNamedAccounts, deployments} = hre;
//     // hre.getNamedAccounts
//     // hre.deployments
// }


module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;
    
    

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)){ // developmentChains = ["hardhat", "localhost"]
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else{
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }  
    const args = [ethUsdPriceFeedAddress]

    // log(`Waiting for ${network.config.blockConfirmations} Block Confirmations`)

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address, args)
    }
    log("-----------------------------------------------------------------------------")
    

}
module.exports.tags = ["all", "fundme"]