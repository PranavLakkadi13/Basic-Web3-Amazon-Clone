const { network, ethers} = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let chainId = network.config.chainId;


  log("---------------------------------------------");
  let damazon = await deploy("Damazon", {
    from: deployer,
    args: ["Damazon"],
    log: true,
    waitConfirmations: 1,
  });

  log("The address of Damazon is ", damazon.address);

  if (chainId != "31337" && process.env.Etherscan_API_KEY) {
      log("---------------------------------------------");
      log("contract is being verified....");
      await verify(damazon.address, ["Damazon"]);
  }
};

module.exports.tags = ["Damazon"];
