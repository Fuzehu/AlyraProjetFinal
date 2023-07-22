// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface ITokenize {function _mintToken(address _to, uint256 _tokenId, uint256 _amount) external;}
contract FundRaiser is Ownable, ReentrancyGuard {
    IERC20 public acceptedToken;
    ITokenize public tokenize;
    uint128 public constant TICKET_PRICE = 500 ether; 
    uint24 public constant MAX_TICKETS = 200;
    uint24 public propertyId = 1;
    uint256 public ticketsSold = 0;
    enum WorkflowStatus { Listing,Fundraisinglive,FundraisingComplete,MintingLive }
    WorkflowStatus public currentStatus;
    event StatusChanged(WorkflowStatus newStatus);
    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);
    mapping(address => uint256) public ticketOwners;
    mapping(address => bool) public whitelist;
    constructor(IERC20 _acceptedToken, ITokenize _tokenize) {
        acceptedToken = _acceptedToken;
        tokenize = _tokenize;
        currentStatus = WorkflowStatus.Listing;
    }
    function addToWhitelist(address _address) public onlyOwner {
        require(!whitelist[_address], "The address is already whitelisted");
        whitelist[_address] = true;
        emit AddedToWhitelist(_address); 
    }
    function removeFromWhitelist(address _address) public onlyOwner {
        require(whitelist[_address], "The address is not currently whitelisted");
        whitelist[_address] = false;
        emit RemovedFromWhitelist(_address);
    }
    function startFundraising() public onlyOwner {
        require(currentStatus == WorkflowStatus.Listing, "Cannot start fundraising from current status");
        currentStatus = WorkflowStatus.Fundraisinglive;
        emit StatusChanged(currentStatus);
    }
    function endFundraiser() public onlyOwner {
        require(currentStatus == WorkflowStatus.Fundraisinglive, "Fundraising is already completed");
        require(ticketsSold >= MAX_TICKETS, "Fundraising not finished");
        currentStatus = WorkflowStatus.FundraisingComplete;
        emit StatusChanged(currentStatus);
        uint256 balance = acceptedToken.balanceOf(address(this));
        require(acceptedToken.transfer(owner(), balance), "Failed to transfer the tokens");
    }
    function startMinting() public onlyOwner {
        require(currentStatus == WorkflowStatus.FundraisingComplete, "Fundraising not finished yet");
        currentStatus = WorkflowStatus.MintingLive;
        emit StatusChanged(currentStatus);
    }
    function buyTicket(uint24 numberOfTickets) public nonReentrant {
        require(currentStatus == WorkflowStatus.Fundraisinglive, "Fundraising ended");
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
        tokenize._mintToken(msg.sender, propertyId, ticketsOwned); // access to tokenize via interface
        ticketOwners[msg.sender] = 0;
    }
    function requestRefund() public {
        require(currentStatus == WorkflowStatus.Fundraisinglive, "Fundraising is already completed");
        require(ticketsSold < MAX_TICKETS, "All tickets have been sold");
        require(whitelist[msg.sender], "Your address is not whitelisted");

        uint256 ticketsOwned = ticketOwners[msg.sender];
        require(ticketsOwned > 0, "You do not have any tickets");

        uint256 amountToRefund = ticketsOwned * TICKET_PRICE;
        require(acceptedToken.transfer(msg.sender, amountToRefund), "Failed to refund the tokens");

        ticketOwners[msg.sender] = 0;
        ticketsSold -= ticketsOwned;
    }
    receive() external payable {revert("This contract does not accept ether");} 
    fallback() external payable {revert("This contract does not accept ether");}   
}
