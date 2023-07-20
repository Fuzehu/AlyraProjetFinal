// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Tokenize.sol"; 

    /**
    * @title Fundraiser Contract
    * @author Nicolas Foti
    * @notice The Fundraiser contract operates as a platform for the sale of tickets that can be exchanged for NFT tokens that represents shares of GFV. 
    * @notice Users can purchase tickets using specific ERC20 tokens specified at the creation of the contract. 
    * @notice Once the fundraising is complete, ticket holders can mint a number of NFT according to the number of tickets thhey  own
    */


contract Fundraiser is Ownable, Tokenize, ReentrancyGuard {

    /**
     * @dev Address of the token accepted for purchasing tickets
     */
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

    /**
     * @notice For unit testing purpose, we create a DAI mocked contracts
     *         For Sepolia deployment the token will be DAI coming from Aave faucet with the given Sepolia Address 
     *         " 0xAC164473923FDF6Fc60C655b5425169d1bB3429A "
     * @dev Contract constructor that sets the token to be accepted for buying tickets
     * @param _acceptedToken Address of the ERC20 token to be accepted
     */
    constructor(IERC20 _acceptedToken) { //specifier l'addresse du contrat du token avant de déployer (sepolia = dai faucet Aave)
        acceptedToken = _acceptedToken;
        currentStatus = WorkflowStatus.Fundraising;
    }

///////////////////////////////////////////////// *-- Whitelist Management *-- ///////////////////////////////////////////////

    /**
     * @dev Function to whitelist an address, allowing it to buy tickets
     * @dev This function can only be called by the contract owner
     * @param _address Address to be whitelisted.
     */
    function addToWhitelist(address _address) public onlyOwner {
        require(!whitelist[_address], "The address is already whitelisted");
        whitelist[_address] = true;
    }

    /**
     * @dev Function to remove an address from the whitelist
     * @dev This function can only be called by the contract owner
     * @param _address Address to be removed from the whitelist
     */
    function removeFromWhitelist(address _address) public onlyOwner {
        require(whitelist[_address], "The address is not currently whitelisted");
        whitelist[_address] = false;
    }


///////////////////////////////////////////////// *-- Users interactions *-- ///////////////////////////////////////////////

    /**
     * @dev Function allowing whitelisted addresses to buy tickets.
     * @param numberOfTickets The number of tickets to buy.
     */
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

    /**
     * @dev Function allowing ticket owners to mint tokens in exchange for the amount of owned "tickets"
     */
    function claimTokens() public nonReentrant {
        require(currentStatus == WorkflowStatus.MintingLive, "The token mint is not yet available");
        require(whitelist[msg.sender], "Your address is not whitelisted");
        uint256 ticketsOwned = ticketOwners[msg.sender];
        require(ticketsOwned > 0, "You do not have any tickets");
        
        _mintToken(msg.sender, propertyId, ticketsOwned);
        ticketOwners[msg.sender] = 0;
    }


///////////////////////////////////////////////// *-- WorflowStatus Change *-- ///////////////////////////////////////////////

    /**
    * @dev Function to end the fundraising event and transfer collected tokens to the owner address
    * @dev This function can only be called by the contract owner
    * @dev emit StatusChanged event 
    */
    function endFundraiser() public onlyOwner {
        require(currentStatus == WorkflowStatus.Fundraising, "Fundraising is already completed");
        require(ticketsSold >= MAX_TICKETS, "Fundraising not finished");
        currentStatus = WorkflowStatus.FundraisingComplete;

        emit StatusChanged(currentStatus);

        // Transfer collected tokens to the contract's owner
        uint256 balance = acceptedToken.balanceOf(address(this));
        require(acceptedToken.transfer(owner(), balance), "Failed to transfer the tokens");
    }

    /**
    * @dev Function to start minting
    * @dev This function can only be called by the contract owner
    * @dev emit StatusChanged event 
    */
    function startMinting() public onlyOwner {
        require(currentStatus == WorkflowStatus.FundraisingComplete, "Fundraising not finished yet");
        currentStatus = WorkflowStatus.MintingLive;
        emit StatusChanged(currentStatus);
    }


///////////////////////////////////////////////// *-- Receive and Fallback *-- ////////////////////////////////////////////////

    receive() external payable {
        revert("This contract does not accept ether");
    } 

    fallback() external payable {
        revert("This contract does not accept ether");
    }
    
}
