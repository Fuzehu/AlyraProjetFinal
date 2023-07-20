const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Testing DiscountToken.sol contract', function () {
  let discountToken;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    const DiscountToken = await ethers.getContractFactory('DiscountToken');
    [owner, user1, user2] = await ethers.getSigners();

    discountToken = await DiscountToken.deploy();
  });


  describe('Check the Token Informations', function () {
    it('should have correct name and symbol', async function () {
      const name = await discountToken.name();
      const symbol = await discountToken.symbol();

      expect(name).to.equal('MSVDiscountToken');
      expect(symbol).to.equal('MDT');
    });
  });


  describe('Tests the fonctions over the Admin Rights Administration', function () {
    it('should grant admin rights', async function () {
      await discountToken.connect(owner).addAdminRights(user1.address);
      const isAdmin1 = await discountToken.isAdmin(user1.address);

      expect(isAdmin1).to.be.true;
    });

    it('should revoke admin rights', async function () {
      await discountToken.connect(owner).addAdminRights(user1.address);
      await discountToken.connect(owner).revokeAdminRights(user1.address);
      const isAdmin1 = await discountToken.isAdmin(user1.address);

      expect(isAdmin1).to.be.false;
    });

    it('should revert if the addAdminRights function is not called by the owner', async function () {
      await expect(discountToken.connect(user1).addAdminRights(user2.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('should revert if the revokeAdminRights function is not called by the owner', async function () {
      await discountToken.connect(owner).addAdminRights(user1.address);
      await expect(discountToken.connect(user1).revokeAdminRights(user1.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('should revert if trying to add an existing admin again', async function() {
      await discountToken.connect(owner).addAdminRights(user1.address);
      await expect(discountToken.connect(owner).addAdminRights(user1.address))
          .to.be.revertedWith('Address is already an admin');
    });

    it('should revert if trying to revoke a non-admin', async function() {
        await expect(discountToken.connect(owner).revokeAdminRights(user2.address))
            .to.be.revertedWith('Address is not an admin');
    });

    it('should emit AdminRightsGranted event correctly when a new admin is added', async function () {
      await expect(discountToken.connect(owner).addAdminRights(user1))
        .to.emit(discountToken, 'AdminRightsGranted')
        .withArgs(user1.address);
    });

    it('should emit AdminRightsRevoked event correctly when an admin is removed', async function () {
      await discountToken.connect(owner).addAdminRights(user1);
      await expect(discountToken.connect(owner).revokeAdminRights(user1))
        .to.emit(discountToken, 'AdminRightsRevoked')
        .withArgs(user1.address);
    });
  });

  
  describe('Test regarding the mint function', function () {
    it('should mint the expected number of tokens for a registered admin address', async function () {
      await discountToken.connect(owner).addAdminRights(user1.address);
      await discountToken.connect(user1).mint(owner.address, 100);

      const balance = await discountToken.balanceOf(owner.address);
      expect(balance).to.equal(100);
    });

    it('should revert if the input amount is 0 in the mint function', async function () {
      await discountToken.connect(owner).addAdminRights(user1.address);
      await expect(discountToken.connect(user1).mint(owner.address, 0)).to.be.revertedWith(
        'Mint amount must be greater than 0'
      );
    });

    it('should revert if the mint function is called by non-admin addresses', async function () {
      await expect(discountToken.connect(user2).mint(owner.address, 100)).to.be.revertedWith(
        'You need to be a registered admin in order to mint this token'
      );
    });

    it("should emit TokensMinted event correctly when tokens are minted", async function () {
      await discountToken.connect(owner).addAdminRights(user1.address);
      await expect(discountToken.connect(user1).mint(user2.address, 1000))
        .to.emit(discountToken, 'TokensMinted')
        .withArgs(user2.address, 1000);
    });
  });
});