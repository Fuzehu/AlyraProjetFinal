// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

    /**
     * @title Fundraiser Contract
     * @author Nicolas Foti
     * @notice The Fundraiser contract operates as a platform for the sale of tickets that can be exchanged for NFT tokens that represents shares of GFV
     * @notice Users can purchase tickets using specific ERC20 tokens specified at the creation of the contract
     * @notice Once the fundraising is complete, ticket holders can mint a number of NFT according to the number of tickets thhey  own
     * @dev The minting process is achieved by calling the _mintToken function of the external contract Tokenize which implements the ITokenize interface
     */


/**
 * @title ITokenize Interface
 * @dev This interface outlines the basic minting function of the Tokenise contract that must be implemented to the FundRaiser contract in order for both contracts to comunicate
 */
interface ITokenize {
    function _mintToken(address _to, uint256 _tokenId, uint256 _amount) external;
}


contract FundRaiser is Ownable, ReentrancyGuard {

    /**
     * @dev Address of the token accepted for purchasing tickets
     */
    IERC20 public acceptedToken;
    ITokenize public tokenize;


    uint128 public constant TICKET_PRICE = 500 ether; 
    uint24 public constant MAX_TICKETS = 200;
    uint24 public propertyId = 1;
    uint256 public ticketsSold = 0;


    enum WorkflowStatus { 
        Listing,
        Fundraisinglive,
        FundraisingComplete,
        MintingLive 
    }

    WorkflowStatus public currentStatus;

    event StatusChanged(WorkflowStatus newStatus);
    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);

    mapping(address => uint256) public ticketOwners;
    mapping(address => bool) public whitelist;

    /**
     * @notice For unit testing purpose, we create a DAI mocked contracts
     *         For Goerli deployment the token will be DAI coming from Aave faucet with the given Sepolia Address 
     *         " 0xfA0e305E0f46AB04f00ae6b5f4560d61a2183E00 "
     * @notice This contract also interfaces with the contract Tokenize for token minting operation. The Tokenize contract should implement the ITokenize interface
     * @dev Contract constructor that sets the token to be accepted for buying tickets
     * @param _acceptedToken Address of the ERC20 token to be accepted
     */
    constructor(IERC20 _acceptedToken, ITokenize _tokenize) {
        acceptedToken = _acceptedToken;
        tokenize = _tokenize;
        currentStatus = WorkflowStatus.Listing;
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
        emit AddedToWhitelist(_address); 
    }

    /**
     * @dev Function to remove an address from the whitelist
     * @dev This function can only be called by the contract owner
     * @param _address Address to be removed from the whitelist
     */
    function removeFromWhitelist(address _address) public onlyOwner {
        require(whitelist[_address], "The address is not currently whitelisted");
        whitelist[_address] = false;
        emit RemovedFromWhitelist(_address);
    }


///////////////////////////////////////////////// *-- WorflowStatus Change *-- ///////////////////////////////////////////////

    /**
     * @notice Function that transitions the workflow status from "Listing" to "Fundraising"
     *         It enables the process to move from a state where users can only view the property details 
     *         to a state where they can contribute funds for the purchase of the property.
     * @dev This function can only be called by the contract owner
     * @dev Emits a StatusChanged event
     */
    function startFundraising() public onlyOwner {
        require(currentStatus == WorkflowStatus.Listing, "Cannot start fundraising from current status");
        currentStatus = WorkflowStatus.Fundraisinglive;
        emit StatusChanged(currentStatus);
    }

    /**
     * @notice Function that end the fundraising phase and transfer collected tokens to the owner address
     *         By activating this function the process is in a sort of "pause" where the owner gather the collected money and purchase the property
     * @dev This function can only be called by the contract owner
     * @dev emit StatusChanged event 
     */
    function endFundraiser() public onlyOwner {
        require(currentStatus == WorkflowStatus.Fundraisinglive, "Fundraising is already completed");
        require(ticketsSold >= MAX_TICKETS, "Fundraising not finished");
        currentStatus = WorkflowStatus.FundraisingComplete;

        emit StatusChanged(currentStatus);

        // Transfer collected tokens to the contract's owner
        uint256 balance = acceptedToken.balanceOf(address(this));
        require(acceptedToken.transfer(owner(), balance), "Failed to transfer the tokens");
    }

    /**
     * @notice Function that end the latent phase between the fundraising and the purchase of the property
     *         It then allows users to mint token for the property they own a share of
     * @dev This function can only be called by the contract owner
     * @dev emit StatusChanged event 
     */
    function startMinting() public onlyOwner {
        require(currentStatus == WorkflowStatus.FundraisingComplete, "Fundraising not finished yet");
        currentStatus = WorkflowStatus.MintingLive;
        emit StatusChanged(currentStatus);
    }


///////////////////////////////////////////////// *-- Users interactions *-- ///////////////////////////////////////////////

    /**
     * @dev Function allowing whitelisted addresses to buy tickets
     * @param numberOfTickets The number of tickets to buy
     */
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

    /**
     * @notice This function will call the _mintToken function of the Tokenize contract, providing the caller's address, the property ID, and the number of tickets owned as arguments
     *         After successful minting, the number of tickets owned by the caller is set to zero thus preventing him to continue minting tokens indefinitely
     * @dev Function allowing ticket owners to mint tokens in exchange for the amount of owned "tickets"
     */
    function claimTokens() public nonReentrant {
        require(currentStatus == WorkflowStatus.MintingLive, "The token mint is not yet available");
        require(whitelist[msg.sender], "Your address is not whitelisted");
        uint256 ticketsOwned = ticketOwners[msg.sender];
        require(ticketsOwned > 0, "You do not have any tickets");
        
        tokenize._mintToken(msg.sender, propertyId, ticketsOwned); // access to tokenize via interface
        ticketOwners[msg.sender] = 0;
    }

    /**
     * @notice Function allowing a whitelisted user to request a refund of the tickets he owns
     * @notice This function design have been chosen in order to mitigate potential security risks associated with loops
     *         The chosen mapping structure allows us to access and manipulate individual user's data directly, which is more secure.
     *         However each participant might have to take individual actions in order to get back its tokens and pay gas fees. 
     * @dev User must own tickets and the Fundraising must not be completed for the refund to be processed
     * @dev On successful refund, the amount of owned tickets is set to zero and the total sold tickets is decreased
     * @dev It is the responsibility of the user to trigger this function
     * @dev This function uses the ERC20 transfer function to process the refund and requires the operation to succeed
     */
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

///////////////////////////////////////////////// *-- Receive and Fallback *-- ////////////////////////////////////////////////

    receive() external payable {
        revert("This contract does not accept ether");
    } 

    fallback() external payable {
        revert("This contract does not accept ether");
    }
    
}
