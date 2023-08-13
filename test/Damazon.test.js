const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
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
          const owner = await Damazon.getOwner();
          assert.equal(name.toString(), "Damazon");
          assert.equal(owner, deployer);
        });
    });
  describe("Checks the list function", () => {
    it("Only allow the owner to list", async () => {
      const accounts = await ethers.getSigners()  
      await expect(
        Damazon.connect(accounts[1]).List(
          items[0].id,
          items[0].name,
          items[0].category,
          items[0].image,
          tokens(items[0].price),
          items[0].rating,
          items[0].stock
        )
      ).to.be.revertedWithCustomError(Damazon, "Damazon__NotOwner");
      })
      it("It emits an event", async () => {
        await expect(
          Damazon.List(
            items[0].id,
            items[0].name,
            items[0].category,
            items[0].image,
            tokens(items[0].price),
            items[0].rating,
            items[0].stock
          )
        ).to.emit(Damazon, "Item_Listed");
      });
      it("It checks the emmited event", async () => {
        const transaction = await Damazon.List(
          items[0].id,
          items[0].name,
          items[0].category,
          items[0].image,
          tokens(items[0].price),
          items[0].rating,
          items[0].stock
        );
        
        const transactionReceipt = await transaction.wait(1);

        const stock = transactionReceipt.logs[0].topics[3];
        const val = stock.slice(stock.length - 1,stock.length);
        assert.equal(val.toString(), "a");
      })      
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
        }

        const Item = await Damazon.items(1);
        assert.equal(Item[1], "Camera");
      });

      describe("Checking the buy function", () => {
        beforeEach(async () => {
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
          }
        })
        
        it("Now we can buy an item", async () => {
          await expect(await Damazon.Buy("1", { value: ethers.parseEther("1") })).to.emit(Damazon, "Buy_Item")
        });
        
        it("It gets reverted when enough ether not sent", async () => {
          await expect(
            Damazon.Buy("1", { value: ethers.parseEther("0.99") })
          ).to.be.revertedWithCustomError(Damazon, 'Damazon__NotEnoughEthSent')
        });
        
        it("reverts when item not in stock", async () => {
          await expect(
            Damazon.Buy("6", { value: ethers.parseEther("1.25") })
          ).to.be.revertedWithCustomError(Damazon, "Damazon__OutOfStock");
        })

        it("updates the item stock and order mapping", async () => {
          await Damazon.Buy("1", { value: ethers.parseEther("1") });
          const Item = await Damazon.items("1");
          assert.notEqual(Item.stock, items[0].stock);
          assert.equal(await Damazon.orderCount(deployer), "1");
        });

        it("should break if a invalid item is purchased", async () => {
          await expect(
            Damazon.Buy("10", { value: ethers.parseEther("1") })
          ).to.be.revertedWithCustomError(Damazon, 'Damazon__InvalidItemId');
          
          await expect(
            Damazon.Buy("0", { value: ethers.parseEther("1") })
          ).to.be.revertedWithCustomError(Damazon, "Damazon__InvalidItemId");
        })

        it("It shows the orders of the address", async () => {
          await Damazon.Buy("1", { value: ethers.parseEther("1") });
          const Order1 = await Damazon.orders(
            deployer,
            Damazon.orderCount(deployer)
          );
          console.log(Order1)
          await Damazon.Buy("1", { value: ethers.parseEther("1") });
          const Order = await Damazon.orders(deployer, Damazon.orderCount(deployer));
          console.log(Order);
          assert(await Damazon.orders(deployer, Damazon.orderCount(deployer)));
        })
      });

      describe("Withdraw function", () => {
        beforeEach(async () => {
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
          }
        });

        // Irrespective of who calls the function, the amount will be transferred to owner
        it("allows withdrawal", async () => {
          const balance = await ethers.provider.getBalance(deployer);
          console.log(balance);
          const accounts = await ethers.getSigners()
          const testDeposit = await Damazon.connect(accounts[1])
          await testDeposit.Buy("1", { value: ethers.parseEther("1") });
          await testDeposit.withdraw();
          const bal = await ethers.provider.getBalance(deployer);
          console.log(bal);
        });

        it("allows withdraw even when the balance is 0", async () => {
          const accounts = await ethers.getSigners();
          const testDeposit = await Damazon.connect(accounts[1]);
          assert(await testDeposit.withdraw());
        })
      })
  });
});
