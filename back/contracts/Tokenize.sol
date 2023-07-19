// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";


/**
 * @title Tokenize Contract
 * @author Nicolas Foti
 * @notice This contract aims to tokenize a given GFV (Groupement Foncier Viticole) into equal shares by minting a specific ERC1155 token IDs
 *         The metadata set through the URI defines the attributes of the tokenized GFV, such as legal information, unitary value, and total supply
 */


contract Tokenize is ERC1155URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;


    struct GFV {
        string tokenName;
        uint256 tokenId; // can't set lower uint as we're using the Counters library
        uint16 totalSupply;
        string tokenURI;
    }


    GFV[] public _gfvTokens;

    bool private _initialized = false;

    /// event emitted when a new token is minted
    event TokenMinted(uint256 indexed tokenId, string tokenName, uint16 totalSupply, string uri); 


    constructor() ERC1155("") {}

    
    /**
     * @notice Initialize the contract by minting the GENESIS token and assigning it to the a given address (owner)
     *         This function can only be called by the contract owner
     * @dev This function represents an Easter egg related to blockchain concepts, as the first token minted is called "GENESIS" similar to the first block of a blockchain
     *      Additionally, the "GENESIS" token will be stored at index 0 of the _gfvTokens array, while the next token minted; tokenId 1 will get the index 1 : this arrangement follows a logical pattern
     */
    function init() external onlyOwner {
        require(!_initialized, "Init has already been called");
        _gfvTokens.push(GFV("GENESIS", 0, 1, ""));
        _mint(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 0, 1, "");
        _initialized = true;
    } 
    

    /**
     * @notice Mint a new ERC1155 token with a specific tokenId and assign it to the specified address
     *         This function can only be called by the contract owner
     * @param _to The address to assign the minted token to
     * @param _totalSupply The total supply of the minted token
     * @param _tokenName The name of the minted token
     * @param _tokenURI The URI of the metadata for the minted token
     * @dev Generate a new ID for the token that is to be minted
     * @dev Add the new GFV object generated through the token mint to the GFV array
     * @dev Set the unique URI for the new token that is to be minted
     * @dev Mint the token with the correct information
     * @dev Emit a TokenMinted event with the tokenId of the minted token, its token name, total supply, and the URI
     */
    function mintToken(address _to, uint16 _totalSupply, string memory _tokenName, string memory _tokenURI) external onlyOwner { 
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _gfvTokens.push(GFV(_tokenName, newTokenId, _totalSupply, _tokenURI));

        _setURI(newTokenId, _tokenURI);
        
        _mint(_to, newTokenId, _totalSupply, "");
        emit TokenMinted(newTokenId, _tokenName, _totalSupply, _tokenURI);
    }

}