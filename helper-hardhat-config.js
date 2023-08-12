const networkConfig = {
  default: {
    name: "hardhat",
  },
  31337: {
    name: "localhost",
  },
  11155111: {
    name: "sepolia",
  },
  1: {
    name: "mainnet",
  },
};

const developmentChains = ["hardhat", "localhost", "31337"];


module.exports = [developmentChains, networkConfig];