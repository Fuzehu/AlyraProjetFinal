// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Tokenize.sol"; 

contract Fundraiser is Ownable, Tokenize, ReentrancyGuard {

    IERC20 public acceptedToken;

    uint128 public constant TICKET_PRICE = 500 ether; // drop the price to 50 on testnet deployment for tokens accessibility reseasons
    uint24 public constant MAX_TICKETS = 200;
    uint24 public ticketsSold = 0;
    uint24 public propertyId = 1;

    enum WorkflowStatus { 
        Fundraising,
        FundraisingComplete,
        MintingLive 
    }

    WorkflowStatus public currentStatus;

    event StatusChanged(WorkflowStatus newStatus);

    mapping(address => uint256) public ticketOwners;
    mapping(address => bool) public whitelist;

    constructor(IERC20 _acceptedToken) { //specifier l'addresse du contrat du token avant de déployer (sepolia = dai faucet Aave)
        acceptedToken = _acceptedToken;
        currentStatus = WorkflowStatus.Fundraising;
    }

    function addToWhitelist(address _address) public onlyOwner {
        require(!whitelist[_address], "The address is already whitelisted");
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) public onlyOwner {
        require(whitelist[_address], "The address is not currently whitelisted");
        whitelist[_address] = false;
    }

    function buyTicket(uint24 numberOfTickets) public nonReentrant {
        require(currentStatus == WorkflowStatus.Fundraising, "Fundraising ended");
        require(whitelist[msg.sender], "Your address is not whitelisted");
        require(numberOfTickets > 0, "At least 1 ticket must be purchased");
        require(ticketsSold + numberOfTickets <= MAX_TICKETS, "There are not enough tickets available");

        uint256 amountToTransfer = TICKET_PRICE * numberOfTickets;
        
        acceptedToken.transferFrom(msg.sender, address(this), amountToTransfer);

        ticketOwners[msg.sender] += numberOfTickets;
        ticketsSold += numberOfTickets;
    }

    function claimTokens() public nonReentrant {
        require(currentStatus == WorkflowStatus.MintingLive, "The token mint is not yet available");
        require(whitelist[msg.sender], "Your address is not whitelisted");
        uint256 ticketsOwned = ticketOwners[msg.sender];
        require(ticketsOwned > 0, "You do not have any tickets");
        
        _mintToken(msg.sender, propertyId, ticketsOwned);
        ticketOwners[msg.sender] = 0;
    }

    function endFundraiser() public onlyOwner {
        require(currentStatus == WorkflowStatus.Fundraising, "Fundraising is already completed");
        require(ticketsSold >= MAX_TICKETS, "Fundraising not finished");
        currentStatus = WorkflowStatus.FundraisingComplete;

        emit StatusChanged(currentStatus);

        // Transfer collected tokens to the contract's owner
        uint256 balance = acceptedToken.balanceOf(address(this));
        require(acceptedToken.transfer(owner(), balance), "Failed to transfer the tokens");
    }

    function startMinting() public onlyOwner {
        require(currentStatus == WorkflowStatus.FundraisingComplete, "Fundraising not finished yet");
        currentStatus = WorkflowStatus.MintingLive;
        emit StatusChanged(currentStatus);
    }

    receive() external payable {
        revert("This contract does not accept ether");
    } 

    fallback() external payable {
        revert("This contract does not accept ether");
    }
    
}
