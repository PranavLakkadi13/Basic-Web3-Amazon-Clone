const { network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { items } = require("../src/items.json");

async function list() {
    let Damazon;
    let deployer;
    deployer = (await getNamedAccounts()).deployer;
    Damazon = await ethers.getContract("Damazon");

    const tokens = (n) => {
      return ethers.parseUnits(n.toString(), "ether");
    };

    for (let j = 0; j < items.length; j++) {
      console.log("The item has been listed....");  
      await Damazon.List(
            items[j].id,
            items[j].name,
            items[j].category,
            items[j].image,
            tokens(items[j].price),
            items[j].rating,
            items[j].stock
        );
    }
}

list()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });