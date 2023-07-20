// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./DiscountToken.sol";
import "./Tokenize.sol"; 


/**
 * @title StakingTokenId1 Contract
 * @author Nicolas Foti
 * @notice This contract aims to provide a staking interface that allows users to generate MDT tokens by staking their ERC1155 TokenID1 NFTs
 */


contract StakingERC1155Id1 is ERC1155Receiver, Ownable, ReentrancyGuard {
    Tokenize public erc1155Contract;
    DiscountToken public erc20Contract;


    struct StakedTokenInfo {
        uint24 stakedAmount;
        uint256 stakingStartTime;
    }

    mapping(address => StakedTokenInfo) public stakedTokens;

    uint256 public rewardsRatePerSecond;

    event Staked(address indexed staker, uint24 _tokenId, uint24 amountStaked);
    event Unstaked(address indexed staker, uint24 _tokenId, uint24 amountUnstaked);
    event Claimed(address indexed staker, uint256 amountClaimed);
    event RewardsRateUpdated(uint256 newRate);


    /**
     * @notice Constructs a new instance of the StakingProtocol contract
     * @param _erc1155Contract The address of the Tokenize ERC1155 contract used for staking
     * @param _erc20Contract The address of the DiscountToken ERC20 contract used for rewards distribution
     * @dev Initializes the erc1155Contract and erc20Contract variables with the provided contract addresses
     * @dev This contract uses a fixed reward rate per second to control the generation of tokens. 
     * We want a user to generate 6 tokens over a period of 9 months. To achieve this, we need to set a certain 
     * reward rate per second. We start by determining the total number of seconds in 9 months which is approximately
     * 23,328,000 seconds (30 days/month * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 9 months).
     * To generate 6 tokens over this period, we divide the total number of tokens by the total number of seconds. 
     * This gives us a reward rate of 0.000000257201646090534 tokens per second (6 tokens / 23,328,000 seconds).
     * However, since we are dealing with Ethereum, we often perform calculations at a scale of 10^-18 for precision. 
     * So we multiply our reward rate by 10^18 to get our final reward rate per second in terms of wei (the smallest 
     * denomination of ether). This comes out to be approximately 257201 tokens per second at a scale of 10^-18 
     * (0.000000257201646090534 tokens/second * 10^18).
     * This means that with this reward rate, a user staking its tokens will generate approximately 6 tokens over 
     * a period of 9 months for each token staked.
     */
    constructor(address _erc1155Contract, address _erc20Contract) {
        erc1155Contract = Tokenize(_erc1155Contract); 
        erc20Contract = DiscountToken(_erc20Contract); 
        rewardsRatePerSecond = 257201;
    }


///////////////////////////////// *-- Internal _claimRewards and rewards generation logic *-- /////////////////////////////////

    /**
     * @notice Internal function that compute generated rewards and claim rewards for a given staker
     * @param _staker Staker's address
     * @dev Retrieves the staked token information for the given staker
     * @dev Checks if the staker has any tokens staked
     * @dev Calculates the staking period based on the current timestamp and the staking start time
     * @dev Calculates the rewards earned by multiplying the staked amount, staking period, and rewards rate per minute
     * @dev Requires that the rewards earned are greater than 0
     * @dev Mints the rewards earned by the staker address using the DiscountToken contract
     * @dev Reset the staking start time to the current timestamp
     * @dev Emits a Claimed event with rewards earned by the given staker address 
     */
    function _claimRewards(address _staker) internal {
        StakedTokenInfo storage tokenInfo = stakedTokens[_staker];
        require(tokenInfo.stakedAmount > 0, "StakingContract: No token staked");

        uint256 stakingPeriod = block.timestamp - tokenInfo.stakingStartTime;
        uint256 rewardsEarned = tokenInfo.stakedAmount * stakingPeriod * rewardsRatePerSecond;

        require(rewardsEarned > 0, "StakingContract: No rewards earned");
        erc20Contract.mint(_staker, rewardsEarned); // require to set this contract as "Admin" in the DiscountToken contract
        
        tokenInfo.stakingStartTime = block.timestamp;
        emit Claimed(_staker, rewardsEarned);
    }


///////////////////////////////////////////////// *-- Staking functions  *-- //////////////////////////////////////////////////

    /**
     * @notice Allows a user to stake ERC1155 tokens in the Staking Pool
     * @param _amount The amount of tokens to be staked
     * @dev Requires that the amount to be staked is greater than 0
     * @dev Requires that the token ID is 1, as only tokens with ID 1 can be staked in this Staking Pool
     * @dev If the user already has tokens staked, calls the internal _claimRewards function to claim any pending rewards in order to set a common stakingStartTime for all staked tokens
     * @dev Updates the staked token information for the given user 
     * @dev Emits a Staked returning the unstaked token ID and the amount of tokens staked by the given staker address 
     * @dev This function is non-reentrant to prevent reentrant calls during the staking process
     */
    function stakeERC1155ID1(uint24 _amount) external nonReentrant {
        require(_amount > 0, "StakingContract: Invalid amount");
        uint8 _tokenId = 1;
        StakedTokenInfo storage tokenInfo = stakedTokens[msg.sender];

        if (tokenInfo.stakedAmount > 0) {
            _claimRewards(msg.sender);
        }

        erc1155Contract.safeTransferFrom(msg.sender, address(this), _tokenId, _amount, "");

        tokenInfo.stakedAmount += _amount;
        tokenInfo.stakingStartTime = block.timestamp;

        emit Staked(msg.sender, _tokenId, _amount);
    }


    /**
     * @notice Allows the staker to claim its pending rewards from the staking pool
     * @dev Calls the internal _claimRewards function to calculate and mint the rewards for the caller
     * @dev This function is non-reentrant to prevent reentrant calls during the rewards claiming process
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }


    /**
     * @notice Allows the staker to unstake its staked tokens from the Staking Pool
     * @param _unstakeAmount The amount of tokens to be unstaked
     * @dev Requires that the unstake amount is greater than 0
     * @dev Requires that the user has staked at least the specified unstake amount of tokens
     * @dev Calls the internal _claimRewards function to claim any pending rewards before unstaking, as it may cause a loss of rewards earned
     * @dev Transfers the staked tokens from the contract back to the user's address
     * @dev Updates the staked token information for the given user by subtracting the unstaked amount
     * @dev Emits an Unstaked event returning the unstaked token ID and the amount of tokens unstaked by the given staker address 
     * @dev This function is non-reentrant to prevent reentrant calls during the unstaking process
     */
    function unstake(uint24 _unstakeAmount) external nonReentrant {
        uint8 _tokenId = 1;
        require(_unstakeAmount > 0, "StakingContract: Invalid unstaked amount");

        StakedTokenInfo storage tokenInfo = stakedTokens[msg.sender];
        require(tokenInfo.stakedAmount >= _unstakeAmount, "StakingContract: Insufficient staked amount");

        // Claim rewards before unstaking as it may cause a loss of rewards earned
        _claimRewards(msg.sender); 

        erc1155Contract.safeTransferFrom(address(this), msg.sender, _tokenId, _unstakeAmount, "");

        // Update the stakedTokens information by removing the staker's unstaked tokens.
        tokenInfo.stakedAmount -= _unstakeAmount;

        emit Unstaked(msg.sender, _tokenId, _unstakeAmount);
    }



/////////////////////////////////////////////////////// *-- Getters *-- ///////////////////////////////////////////////////////

    /**
     * @notice Returns the pending rewards present in the Staking Pool for msg.sender
     * @return rewards The amount of pending rewards for the given staker
     * @dev Requires that the user has staked at least one token
     * @dev Calculates the staking period based on the current timestamp and the staking start time of the user's tokens
     * @dev Calculates the rewards by multiplying the staked amount, staking period, and rewards rate per minute
     */
    function getPendingRewards() external view returns (uint256) {
        StakedTokenInfo storage tokenInfo = stakedTokens[msg.sender];
        require(tokenInfo.stakedAmount > 0, "StakingContract: No token staked");

        uint256 stakingPeriod = block.timestamp - tokenInfo.stakingStartTime;
        uint256 rewards = tokenInfo.stakedAmount * stakingPeriod * rewardsRatePerSecond;
        return rewards;
    }


    /**
     * @notice Returns the amount of tokens staked by a given user in the Staking Pool
     * @param user The user address to retrieve the staked amount for
     * @return stakedAmount The amount of tokens staked for the given user
     */
    function getStakedAmount(address user) external view returns (uint24) {
        return stakedTokens[user].stakedAmount;
    }


////////////////////////////////////////// *-- Set a new Rewards Rate Per Minute *-- //////////////////////////////////////////

    /**
    * @notice Updates the rewards rate per minute in the Staking Pool
    * @param _newRate The new rewards rate per minute to be set
    * @dev Only the contract owner can update the rewards rate
    * @dev Emits a RewardsRateUpdated with the _newRate settled
    */
    function updateRewardsRatePerSeconds(uint256 _newRate) onlyOwner external {
        rewardsRatePerSecond = _newRate;
        emit RewardsRateUpdated(_newRate);
    }

                                              
/////////////////////////////////////////////// *-- Handle ERC1155 receiver *-- ///////////////////////////////////////////////                    

    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }


    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }


///////////////////////////////////////////////// *-- Receive and Fallback *-- ////////////////////////////////////////////////

    receive() external payable {
        revert("This contract does not accept ether");
    } 

    fallback() external payable {
        revert("This contract does not accept ether");
    }

}
