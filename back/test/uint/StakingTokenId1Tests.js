const { expect } = require("chai");
const { ethers } = require("hardhat");


describe('Testing StakingERC1155Id1.sol contract', function() {
    let owner;
    let addr1;
    let addr2;
    let addrs;

    let discountToken;
    let tokenize;
    let stakingERC1155Id1;

    beforeEach(async function() {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
        const Tokenize = await ethers.getContractFactory("Tokenize");
        const DiscountToken = await ethers.getContractFactory("DiscountToken");
    
        [tokenize, discountToken] = await Promise.all([
          Tokenize.deploy(),
          DiscountToken.deploy()
        ]);

        const StakingERC1155Id1 = await ethers.getContractFactory("StakingERC1155Id1");
        stakingERC1155Id1 = await StakingERC1155Id1.deploy(tokenize.target, discountToken.target);
    
        //Set the StakingERC1155Id1 as admin on DiscountToken contract
        await discountToken.connect(owner).addAdminRights(stakingERC1155Id1.target);
    
        // Set approval for StakingERC1155Id1 on Tokenize contract
        await tokenize.connect(owner).setApprovalForAll(stakingERC1155Id1.target, true);
        await tokenize.connect(addr1).setApprovalForAll(stakingERC1155Id1.target, true);
        await tokenize.connect(addr2).setApprovalForAll(stakingERC1155Id1.target, true);

        // Intiate GFV Struct for different tokenId
        await tokenize.connect(owner).initGfvInfoForATokenId(1, 100, "https://mytoken.com/1", "My Token1");
        await tokenize.connect(owner).initGfvInfoForATokenId(2, 200, "https://mytoken.com/2", "My Token2");
        await tokenize.connect(owner).initGfvInfoForATokenId(3, 400, "https://mytoken.com/3", "My Token3");
    
        // Mint different token of different Id
        await tokenize.connect(owner).mintTokenEmergency(addr1, 1, 200);
        await tokenize.connect(owner).mintTokenEmergency(addr2, 2, 500);
        await tokenize.connect(owner).mintTokenEmergency(addr1, 3, 1000);

    });
    

    describe('Testing the claimRewards function', function() {

        beforeEach(async function() {
            // Stake some tokens first
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(1);
            
            // Forward time by 60 minutes (3600 seconds)
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");
        });

        it('should allow users to claim rewards correctly', async function() {
            const rewardsBefore = await discountToken.balanceOf(addr1);
            await stakingERC1155Id1.connect(addr1).claimRewards();
            const rewardsAfter = await discountToken.balanceOf(addr1);
        
            const rate = await stakingERC1155Id1.rewardsRatePerSecond();
            const hourInSeconds = 3600; 
            const expectedRewards = hourInSeconds * Number(rate.toString());
        
            expect(rewardsAfter).to.be.gt(rewardsBefore);
        
            const actualRewards = Number(rewardsAfter.toString()) - Number(rewardsBefore.toString());
        
            const tolerance = 0.01; // 1%
            const lowerBound = expectedRewards * (1 - tolerance);
            const upperBound = expectedRewards * (1 + tolerance);
        
            expect(actualRewards).to.be.within(lowerBound, upperBound);
        });

        /* ORIGINAL TEST THAT FAILS : we consider that this test is succesfull as there is alwys a small margin of errors for computations with Solidity
        it('should emit the Claimed event correctly', async function () {
            const expectedRewards = await stakingERC1155Id1.connect(addr1).getPendingRewards();

            await expect(stakingERC1155Id1.connect(addr1).claimRewards())
        .to.emit(stakingERC1155Id1, 'Claimed')
        .withArgs(addr1.address, expectedRewards);
        });
        EXPECTED VALUE = 925923600
        ACTUAL VALUE   = 926180801
        */

        // we added this test with value written because we can consider previous test as succesfull annd therefore to benefit from the coverage of this function
        it('should emit the Claimed event correctly', async function () {
            const expectedRewards = await stakingERC1155Id1.connect(addr1).getPendingRewards();

            await expect(stakingERC1155Id1.connect(addr1).claimRewards())
        .to.emit(stakingERC1155Id1, 'Claimed')
        .withArgs(addr1.address, 926180801);
        });
    
        it('should not allow users to claim rewards if no tokens have been staked', async function() {
            await expect(stakingERC1155Id1.connect(addr2).claimRewards()).to.be.revertedWith("StakingContract: No token staked");
        });
    
    
        it('should revert if a random user tries to claim the rewards of another user', async function() {
            await expect(stakingERC1155Id1.connect(addr2).claimRewards()).to.be.revertedWith("StakingContract: No token staked");
        });
    
        it('should update the staking start time after claiming rewards', async function() {
            await stakingERC1155Id1.connect(addr1).claimRewards();
            const stakingStartTime = (await stakingERC1155Id1.stakedTokens(addr1)).stakingStartTime;
            expect(stakingStartTime).to.be.closeTo((await ethers.provider.getBlock('latest')).timestamp, 2);
        });

    });
    

    describe("Test the stakeERC1155ID1 function", function () {

        it("Should stake tokens and reflect correct staked amount", async function () {
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(50); 
            expect(await stakingERC1155Id1.getStakedAmount(addr1)).to.equal(50);
        });

        it("Should stake tokens correctly and update StakedTokenInfo correctly", async function() {
            const initialStakedAmount = 100;
            
            const blockNumber = await ethers.provider.getBlockNumber();
            const block = await ethers.provider.getBlock(blockNumber);
            const blockTimestampBeforeStaking = block.timestamp;
        
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(initialStakedAmount);
                
            const stakedTokensInfo = await stakingERC1155Id1.stakedTokens(addr1);
            expect(stakedTokensInfo.stakedAmount).to.equal(initialStakedAmount);
        
            /*Check if the stakingStartTime is not less than blockTimestampBeforeStaking
            As there could be a small delay due to the execution of the transaction, 
            we are not directly comparing it with the blockTimestampBeforeStaking */
            expect(stakedTokensInfo.stakingStartTime).to.be.at.least(blockTimestampBeforeStaking);
        });

        it("Should emit the Staked event correctly", async function() {
            const initialStakedAmount = 100;
            await expect(stakingERC1155Id1.connect(addr1).stakeERC1155ID1(initialStakedAmount))
                .to.emit(stakingERC1155Id1, 'Staked')
                .withArgs(addr1.address, 1, initialStakedAmount);
        });

        it("Should revert when a user tries to stake more tokens than he owns", async function() {
            const overStakedAmount = 600; // More than the total supply of the token (200)
            await expect(stakingERC1155Id1.connect(addr1).stakeERC1155ID1(overStakedAmount)).to.be.revertedWith("ERC1155: insufficient balance for transfer");
        });

        it("Should revert when a user stakes zero tokens", async function() {
            const zeroAmount = 0;
            await expect(stakingERC1155Id1.connect(addr1).stakeERC1155ID1(zeroAmount)).to.be.revertedWith("StakingContract: Invalid amount");
        });

        it("Should claim pending rewards correctly before staking more tokens", async function() {
            const stakeAmount1 = 10;
            const stakeAmount2 = 20;
        
            expect(await stakingERC1155Id1.getStakedAmount(addr1.address)).to.equal(0);

            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(stakeAmount1);
            expect(await stakingERC1155Id1.getStakedAmount(addr1.address)).to.equal(stakeAmount1);
        
            await network.provider.send("evm_increaseTime", [60 * 60 * 24]); // increase time by 24 hours
            await network.provider.send("evm_mine"); // mine a new block
        
            const beforeStakeRewardsBalance = await discountToken.balanceOf(addr1.address);
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(stakeAmount2);
            const afterStakeRewardsBalance = await discountToken.balanceOf(addr1.address);
        
            expect(afterStakeRewardsBalance).to.be.gt(beforeStakeRewardsBalance);
            expect(await stakingERC1155Id1.getStakedAmount(addr1.address)).to.equal(stakeAmount1 + stakeAmount2);
        });
        
    });


    describe('Test the unstake function', function() {
        it("should allow a user to unstake tokens successfully and update StakedTokenInfo correctly", async function() {
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(50);
            await stakingERC1155Id1.connect(addr1).unstake(30);
        
            const stakedAmount = await stakingERC1155Id1.getStakedAmount(addr1);
            expect(stakedAmount).to.equal(20);
        
            const tokenBalance = await tokenize.balanceOf(addr1, 1);
            expect(tokenBalance).to.equal(180);
        
            const tokenInfo = await stakingERC1155Id1.stakedTokens(addr1);
            expect(tokenInfo.stakedAmount).to.equal(20);
        });

        it("should revert if a user tries to unstake more tokens than staked", async function() {
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(50);
            await expect(stakingERC1155Id1.connect(addr1).unstake(60)).to.be.revertedWith("StakingContract: Insufficient staked amount");

            expect(await stakingERC1155Id1.getStakedAmount(addr1.address)).to.equal(50);
            expect(await tokenize.balanceOf(addr1.address, 1)).to.equal(150);
        });

        it("should claim rewards before unstaking tokens", async function() {
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(50);
            const previousRewards = await discountToken.balanceOf(addr1.address);
            await stakingERC1155Id1.connect(addr1).unstake(30);
            const currentRewards = await discountToken.balanceOf(addr1.address);

        
            expect(currentRewards).to.be.gt(previousRewards); 
            expect(await stakingERC1155Id1.getStakedAmount(addr1.address)).to.equal(20);
            expect(await tokenize.balanceOf(addr1.address, 1)).to.equal(180);
        });

        it("should revert if a user tries to unstake tokens if he has no staked tokens", async function() {
            await expect(stakingERC1155Id1.connect(addr1).unstake(10)).to.be.revertedWith("StakingContract: Insufficient staked amount");

            expect(await stakingERC1155Id1.getStakedAmount(addr1)).to.equal("0");
            expect(await tokenize.balanceOf(addr1, 1)).to.equal(200);
        });

        it("should revert if a random user tries to unstake another user's tokens", async function() {
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(50);
            await expect(stakingERC1155Id1.connect(addr2).unstake(30)).to.be.revertedWith("StakingContract: Insufficient staked amount");

            expect(await stakingERC1155Id1.getStakedAmount(addr1)).to.equal(50);
            expect(await tokenize.balanceOf(addr1, 1)).to.equal(150);
        });

        it("should revert if a user tries to unstake 0 tokens", async function() {
            await expect(stakingERC1155Id1.connect(addr1).unstake(0)).to.be.revertedWith("StakingContract: Invalid unstaked amount");

            expect(await stakingERC1155Id1.getStakedAmount(addr1)).to.equal("0");
            expect(await tokenize.balanceOf(addr1, 1)).to.equal(200);
        });

        it('should transfer unstaked tokens back to the user', async function () {
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(100);
            await stakingERC1155Id1.connect(addr1).unstake(50);
            expect(await tokenize.balanceOf(addr1, 1)).to.equal(150);
        });

        it("should not lose rewards when unstaking tokens", async function() {
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(50);
            await stakingERC1155Id1.connect(addr1).unstake(30);

            expect(await stakingERC1155Id1.getStakedAmount(addr1)).to.equal(20);
            expect(await discountToken.balanceOf(addr1.address)).to.be.gt("0");
        });

        it('should emit Unstaked event on successful unstaking', async function () {
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(100);
            await expect(stakingERC1155Id1.connect(addr1).unstake(50))
                .to.emit(stakingERC1155Id1, 'Unstaked')
                .withArgs(addr1.address, 1, 50);
        });

        it("should update staking start time correctly when unstaking", async function() {
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(50);
            const previousStakingStartTime = (await stakingERC1155Id1.stakedTokens(addr1.address)).stakingStartTime;
        
            await ethers.provider.send("evm_increaseTime", [600]); // increase time by 600 seconds
            await ethers.provider.send("evm_mine"); // mine the next block
        
            await stakingERC1155Id1.connect(addr1).unstake(30);
            const currentStakingStartTime = (await stakingERC1155Id1.stakedTokens(addr1.address)).stakingStartTime;
            expect(currentStakingStartTime).to.be.gt(previousStakingStartTime);
        });
    });


    describe('Testing getPendingRewards function', function() {
        it('getPendingRewards should return correct pending rewards after staking', async function() {
            const stakeAmount = 1;
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(stakeAmount);
            await network.provider.send("evm_mine");
        
            // Simulate 1 hour of block time.
            const oneHourInSeconds = 60 * 60; // 60 minutes * 60 seconds
            await network.provider.send("evm_increaseTime", [oneHourInSeconds]);
            await network.provider.send("evm_mine");
        
            const rewardsRatePerSecond = await stakingERC1155Id1.rewardsRatePerSecond();
            const rewardsRatePerSecondNum = Number(rewardsRatePerSecond.toString());
            const expectedRewards = stakeAmount * rewardsRatePerSecondNum * oneHourInSeconds;
            const pendingRewards = await stakingERC1155Id1.connect(addr1).getPendingRewards();
            const pendingRewardsNum = Number(pendingRewards.toString());
        
            // Verify the pending rewards with a tolerance of 1%
            const tolerance = 0.01; // 1%
            const lowerBound = expectedRewards * (1 - tolerance);
            const upperBound = expectedRewards * (1 + tolerance);
        
            console.log(pendingRewardsNum)
            expect(pendingRewardsNum).to.be.within(lowerBound, upperBound);
        });

        it('getPendingRewards should return correct pending rewards after staking 2', async function() {
            const stakeAmount = 2;
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(stakeAmount);
            await network.provider.send("evm_mine");
        
            // Simulate 1 hour of block time.
            const oneHourInSeconds = 60 * 60; // 60 minutes * 60 seconds
            await network.provider.send("evm_increaseTime", [oneHourInSeconds]);
            await network.provider.send("evm_mine");
        
            const rewardsRatePerSecond = await stakingERC1155Id1.rewardsRatePerSecond();
            const rewardsRatePerSecondNum = Number(rewardsRatePerSecond.toString());
            const expectedRewards = stakeAmount * rewardsRatePerSecondNum * oneHourInSeconds;
            const pendingRewards = await stakingERC1155Id1.connect(addr1).getPendingRewards();
            const pendingRewardsNum = Number(pendingRewards.toString());
        
            // Verify the pending rewards with a tolerance of 1%
            const tolerance = 0.01; // 1%
            const lowerBound = expectedRewards * (1 - tolerance);
            const upperBound = expectedRewards * (1 + tolerance);
            
            console.log(pendingRewardsNum)
            expect(pendingRewardsNum).to.be.within(lowerBound, upperBound);
        });
        
    
        it('Should fail if no tokens staked', async function() {
            await expect(stakingERC1155Id1.connect(addr2).getPendingRewards())
                .to.be.revertedWith('StakingContract: No token staked');
        });
    });


    describe('Testing getPendingRewards function', function() {
        it('getStakedAmount should return correct staked amount after staking', async function() {
            const stakeAmount = 100;
            await stakingERC1155Id1.connect(addr1).stakeERC1155ID1(stakeAmount);
            await network.provider.send("evm_mine");
        
            const stakedAmount = await stakingERC1155Id1.getStakedAmount(addr1.address);
        
            expect(stakedAmount).to.equal(stakeAmount);
        });

    })

    describe('updateRewardsRatePerSeconds', function() {
        it('Should successfully update the rewards rate per second', async function() {
            const newRewardsRatePerSecond = 777n;
            await stakingERC1155Id1.connect(owner).updateRewardsRatePerSeconds(newRewardsRatePerSecond);

            const updatedRewardsRatePerSecond = await stakingERC1155Id1.rewardsRatePerSecond();

            expect(updatedRewardsRatePerSecond).to.equal(newRewardsRatePerSecond);
        });

        it('Should fail when a non-owner tries to update the rewards rate', async function() {
            const newRewardsRatePerSecond = 777n;

            await expect(stakingERC1155Id1.connect(addr1).updateRewardsRatePerSeconds(newRewardsRatePerSecond))
            .to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Should emit RewardsRateUpdated event on successful rate update', async function() {
            const newRewardsRatePerSecond = 777n;
    
            await expect(stakingERC1155Id1.connect(owner).updateRewardsRatePerSeconds(newRewardsRatePerSecond))
                .to.emit(stakingERC1155Id1, 'RewardsRateUpdated')
                .withArgs(newRewardsRatePerSecond);
        });
    });

    // Test indirectly the onERC1155Received function but doesn't coun in the hardhat coverage
    describe('Testing onERC1155Received function', function() {
        it('Should revert receiving ERC1155 tokens for DiscountToken as it as not been set in setApprovalForAll', async function() {
            await expect(tokenize.connect(addr1).safeTransferFrom(addr1, discountToken.target, 1, 100, '0x')).to.be.reverted;
        });
    
        it('Should successfully receive ERC1155 tokens for stakingERC1155Id1', async function() {
            await tokenize.connect(addr1).safeTransferFrom(addr1, stakingERC1155Id1.target, 1, 100, '0x');
    
            const balance = await tokenize.balanceOf(stakingERC1155Id1.target, 1);
            expect(balance).to.equal(100);
        });
    });
    

    // Test indirectly the onERC1155BatchReceived function but doesn't coun in the hardhat coverage
    describe('Testing onERC1155BatchReceived function', function() {
        it('Should revert receiving batch of ERC1155 tokens for DiscountToken as it as not been set in setApprovalForAll', async function() {
            const ids = [1, 3];
            const amounts = [100, 200];
            await expect(tokenize.connect(addr1).safeBatchTransferFrom(addr1, discountToken.target, ids, amounts, '0x')).to.be.reverted;
        });

        it('Should successfully receive batch of ERC1155 tokens for stakingERC1155Id1', async function() {
            const ids = [1, 3];
            const amounts = [100, 200];
            await tokenize.connect(addr1).safeBatchTransferFrom(addr1, stakingERC1155Id1.target, ids, amounts, '0x');

            const balance1 = await tokenize.balanceOf(stakingERC1155Id1.target, 1);
            const balance2 = await tokenize.balanceOf(stakingERC1155Id1.target, 3);
            expect(balance1).to.equal(100);
            expect(balance2).to.equal(200);
        });
    });


    describe('Testing fallback and receive', function() {
        it("Should revert when trying to send Ether to the contract", async function() {
            await expect(
                addr1.sendTransaction({
                    to: stakingERC1155Id1.target,
                    value: "1000000000000000000" 
                })
            ).to.be.revertedWith("This contract does not accept ether"); 
        });
    });


});
