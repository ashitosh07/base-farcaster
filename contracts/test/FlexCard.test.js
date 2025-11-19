const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("FlexCard", function () {
  let FlexCard;
  let flexCard;
  let owner;
  let minter;
  let user;
  let addrs;

  beforeEach(async function () {
    [owner, minter, user, ...addrs] = await ethers.getSigners();
    
    FlexCard = await ethers.getContractFactory("FlexCard");
    flexCard = await FlexCard.deploy("FlexCard", "FLEX");
    await flexCard.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await flexCard.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await flexCard.name()).to.equal("FlexCard");
      expect(await flexCard.symbol()).to.equal("FLEX");
    });

    it("Should start with token ID counter at 1", async function () {
      expect(await flexCard.getCurrentTokenId()).to.equal(1n);
    });

    it("Should have zero total supply initially", async function () {
      expect(await flexCard.totalSupply()).to.equal(0n);
    });
  });

  describe("Minter Management", function () {
    it("Should allow owner to add minters", async function () {
      await flexCard.addMinter(minter.address);
      expect(await flexCard.minters(minter.address)).to.be.true;
    });

    it("Should allow owner to remove minters", async function () {
      await flexCard.addMinter(minter.address);
      await flexCard.removeMinter(minter.address);
      expect(await flexCard.minters(minter.address)).to.be.false;
    });



    it("Should emit MinterAdded event", async function () {
      const tx = await flexCard.addMinter(minter.address);
      const receipt = await tx.wait();
      expect(receipt.logs.length).to.be.greaterThan(0);
    });
  });

  describe("Minting", function () {
    const tokenURI = "ipfs://QmTest123";

    beforeEach(async function () {
      await flexCard.addMinter(minter.address);
    });

    it("Should allow minter to mint NFTs", async function () {
      await flexCard.connect(minter).mintTo(user.address, tokenURI);
      
      expect(await flexCard.ownerOf(1n)).to.equal(user.address);
      expect(await flexCard.tokenURI(1n)).to.equal(tokenURI);
      expect(await flexCard.totalSupply()).to.equal(1n);
    });

    it("Should allow owner to mint NFTs", async function () {
      await flexCard.connect(owner).mintTo(user.address, tokenURI);
      
      expect(await flexCard.ownerOf(1n)).to.equal(user.address);
      expect(await flexCard.tokenURI(1n)).to.equal(tokenURI);
    });



    it("Should increment token ID counter", async function () {
      await flexCard.connect(minter).mintTo(user.address, tokenURI);
      expect(await flexCard.getCurrentTokenId()).to.equal(2n);
      
      await flexCard.connect(minter).mintTo(user.address, tokenURI);
      expect(await flexCard.getCurrentTokenId()).to.equal(3n);
    });

    it("Should emit FlexCardMinted event", async function () {
      const tx = await flexCard.connect(minter).mintTo(user.address, tokenURI);
      const receipt = await tx.wait();
      expect(receipt.logs.length).to.be.greaterThan(0);
    });

    it("Should return correct token ID", async function () {
      const tx = await flexCard.connect(minter).mintTo(user.address, tokenURI);
      const receipt = await tx.wait();
      
      // Check the FlexCardMinted event
      const event = receipt.logs.find(log => 
        log.fragment && log.fragment.name === "FlexCardMinted"
      );
      expect(event.args[0]).to.equal(1n); // tokenId
    });
  });

  describe("Token URI", function () {
    const tokenURI = "ipfs://QmTest123";

    beforeEach(async function () {
      await flexCard.addMinter(minter.address);
      await flexCard.connect(minter).mintTo(user.address, tokenURI);
    });

    it("Should return correct token URI", async function () {
      expect(await flexCard.tokenURI(1n)).to.equal(tokenURI);
    });


  });

  describe("Supply Tracking", function () {
    beforeEach(async function () {
      await flexCard.addMinter(minter.address);
    });

    it("Should track total supply correctly", async function () {
      expect(await flexCard.totalSupply()).to.equal(0n);
      
      await flexCard.connect(minter).mintTo(user.address, "ipfs://test1");
      expect(await flexCard.totalSupply()).to.equal(1n);
      
      await flexCard.connect(minter).mintTo(user.address, "ipfs://test2");
      expect(await flexCard.totalSupply()).to.equal(2n);
    });
  });
});