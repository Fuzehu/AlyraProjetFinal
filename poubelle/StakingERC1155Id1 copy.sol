// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./DiscountToken.sol";
import "./Tokenize.sol"; 


contract StakingERC1155Id1 is ERC1155Receiver, Ownable, DiscountToken, ReentrancyGuard {
    Tokenize public erc1155Contract;
    DiscountToken public erc20Contract;

    struct StakedTokenInfo {
        uint24 tokenId;
        uint24 stakedAmount;
        uint256 stakingStartTime;
    }

    mapping(address => StakedTokenInfo) public stakedTokens;

    uint256 public rewardsRatePerSecond;

    event Staked(address indexed staker, uint24 _tokenId, uint24 amountStaked);
    event Unstaked(address indexed staker, uint24 _tokenId, uint24 amountUnstaked);
    event Claimed(address indexed staker, uint256 amountClaimed);
    event RewardsRateUpdated(uint256 newRate);

    constructor(address _erc1155Contract, address _erc20Contract) {
        erc1155Contract = Tokenize(_erc1155Contract); 
        erc20Contract = DiscountToken(_erc20Contract); 
        rewardsRatePerSecond = 257201;
    }

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

    function stakeERC1155ID1(uint24 _tokenId, uint24 _amount) external nonReentrant {
        require(_amount > 0, "StakingContract: Invalid amount");
        require(_tokenId == 1, "StakingContract: Only tokens with ID 1 can be staked in this Staking Pool");

        StakedTokenInfo storage tokenInfo = stakedTokens[msg.sender];

        if (tokenInfo.stakedAmount > 0) {
            _claimRewards(msg.sender);
        }

        erc1155Contract.safeTransferFrom(msg.sender, address(this), _tokenId, _amount, "");

        tokenInfo.tokenId = _tokenId;
        tokenInfo.stakedAmount += _amount;
        tokenInfo.stakingStartTime = block.timestamp;

        emit Staked(msg.sender, _tokenId, _amount);
    }

    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    function unstake(uint24 _unstakeAmount) external nonReentrant {
        require(_unstakeAmount > 0, "StakingContract: Invalid unstaked amount");
        StakedTokenInfo storage tokenInfo = stakedTokens[msg.sender];
        require(tokenInfo.stakedAmount >= _unstakeAmount, "StakingContract: Insufficient staked amount");
        _claimRewards(msg.sender); 
        erc1155Contract.safeTransferFrom(address(this), msg.sender, tokenInfo.tokenId, _unstakeAmount, "");
        tokenInfo.stakedAmount -= _unstakeAmount;
        emit Unstaked(msg.sender, tokenInfo.tokenId, _unstakeAmount);
    }

    function getPendingRewards() external view returns (uint256) {
        StakedTokenInfo storage tokenInfo = stakedTokens[msg.sender];
        require(tokenInfo.stakedAmount > 0, "StakingContract: No token staked");

        uint256 stakingPeriod = block.timestamp - tokenInfo.stakingStartTime;
        uint256 rewards = tokenInfo.stakedAmount * stakingPeriod * rewardsRatePerSecond;
        return rewards;
    }

    function getStakedAmount(address user) external view returns (uint24) {
        return stakedTokens[user].stakedAmount;
    }

    function updateRewardsRatePerSeconds(uint256 _newRate) onlyOwner external {
        rewardsRatePerSecond = _newRate;
        emit RewardsRateUpdated(_newRate);
    }

    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }


    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    receive() external payable {} 
    fallback() external payable {}

}
