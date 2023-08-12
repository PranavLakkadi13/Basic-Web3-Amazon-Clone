const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { items } = require("../src/items.json");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
};

describe("Damazon Test", function () {
    let Damazon;
    let deployer;
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["Damazon"]);
        Damazon = await ethers.getContract("Damazon");
    });
    describe("Checks the constructor", () => {
        it("checks the assignment of state variables", async () => {
          const name = await Damazon.getName();
          assert.equal(name.toString(), "Damazon");
        });
    });
    
  describe("Checks the list function", () => {
    it("Listing all the items", async () => {
      for (let i = 0; i < items.length; i++) {
        const transaction = await Damazon.List(
          items[i].id,
          items[i].name,
          items[i].category,
          items[i].image,
          tokens(items[i].price),
          items[i].rating,
          items[i].stock
        );

        await transaction.wait(1);

        console.log(`Listed item ${items[i].id}: ${items[i].name}`);
      };
    });
  });


  describe("Checks the getter function", () => {
    it("Checks the items mapping", async () => {
      for (let i = 0; i < items.length; i++) {
        await Damazon.List(
          items[i].id,
          items[i].name,
          items[i].category,
          items[i].image,
          tokens(items[i].price),
          items[i].rating,
          items[i].stock
        );
      }
      let Item = await Damazon.items(2);
      assert.equal(Item[1], "Drone");
    });
  });


    });
