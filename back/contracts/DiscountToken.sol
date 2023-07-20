// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


    /**
    * @title DiscountToken Contract
    * @author Nicolas Foti
    * @notice The MDT token enables users to receive a 30% discount on the wine produced from the GFV they own a token
    * @notice 1 MDT equals a 30% discount on 1 bottle of wine
    * @dev The DiscountToken contract mint an ERC20 token that can be minted by registered admins only
    * @dev The MDT token is generated through the staking of ERC1155 tokens
    */


contract DiscountToken is ERC20, Ownable {


    /// @dev Initializes the contract by setting the token name and symbol
    constructor () ERC20('MSVDiscountToken', 'MDT') {}


    mapping (address => bool) public isAdmin;

    event AdminRightsGranted(address indexed newAdminAddress);
    event AdminRightsRevoked(address indexed adminAddress);
    event TokensMinted(address indexed receiver, uint amount);

    /**
     * @notice Grants admin rights to the specified address
     * @notice Only the contract owner can grant admin rights
     * @param _addr The address to grant admin rights to
     */
    function addAdminRights(address _addr) external onlyOwner {
        require(!isAdmin[_addr], "Address is already an admin");
        isAdmin[_addr] = true;
        emit AdminRightsGranted(_addr);
    }


    /**
     * @notice Revokes admin rights from the specified address.
     * @notice Only the contract owner can grant admin rights
     * @param _addr The address to revoke admin rights from.
     */
    function revokeAdminRights(address _addr) external onlyOwner {
        require(isAdmin[_addr], "Address is not an admin");
        isAdmin[_addr] = false;
        emit AdminRightsRevoked(_addr);
    }


    /**
     * @notice Mints new "MDT" tokens and assigns them to the specified address
     * @notice Only registered admins are allowed to mint tokens
     * @param _to The address to assign the minted tokens to
     * @param _amount The amount of tokens to be minted
     */
    function mint(address _to, uint _amount) external{
        require (isAdmin[msg.sender], "You need to be a registered admin in order to mint this token");
        require (_amount > 0, "Mint amount must be greater than 0");

        _mint(_to, _amount);
        emit TokensMinted(_to, _amount);
    }

}