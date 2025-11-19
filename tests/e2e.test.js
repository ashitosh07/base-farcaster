const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('FlexCard E2E Flow', function () {
  let flexCard;
  let owner, minter, user;
  
  before(async function () {
    [owner, minter, user] = await ethers.getSigners();
    
    // Deploy contract
    const FlexCard = await ethers.getContractFactory('FlexCard');
    flexCard = await FlexCard.deploy('FlexCard', 'FLEX');
    await flexCard.waitForDeployment();
    
    // Add minter
    await flexCard.addMinter(minter.address);
  });

  it('Complete mint flow should work', async function () {
    const tokenURI = 'ipfs://QmTestFlexCard123';
    
    // 1. Mint NFT
    const tx = await flexCard.connect(minter).mintTo(user.address, tokenURI);
    const receipt = await tx.wait();
    
    // 2. Verify mint event
    const event = receipt.logs.find(log => 
      log.fragment && log.fragment.name === 'FlexCardMinted'
    );
    expect(event).to.not.be.undefined;
    expect(event.args[1]).to.equal(user.address);
    expect(event.args[2]).to.equal(tokenURI);
    
    // 3. Verify ownership
    const tokenId = event.args[0];
    expect(await flexCard.ownerOf(tokenId)).to.equal(user.address);
    
    // 4. Verify metadata
    expect(await flexCard.tokenURI(tokenId)).to.equal(tokenURI);
    
    // 5. Verify supply
    expect(await flexCard.totalSupply()).to.equal(1);
    
    console.log(`✅ FlexCard #${tokenId} minted successfully to ${user.address}`);
  });

  it('Multiple mints should increment correctly', async function () {
    const tokenURI1 = 'ipfs://QmTest1';
    const tokenURI2 = 'ipfs://QmTest2';
    
    await flexCard.connect(minter).mintTo(user.address, tokenURI1);
    await flexCard.connect(minter).mintTo(user.address, tokenURI2);
    
    expect(await flexCard.totalSupply()).to.equal(3); // Including previous test
    expect(await flexCard.getCurrentTokenId()).to.equal(4); // Next token ID
  });
});