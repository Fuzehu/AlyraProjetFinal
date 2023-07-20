// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title Tokenize Contract
 * @author Nicolas Foti
 * @notice This contract aims to tokenize a given GFV (Groupement Foncier Viticole) into equal shares by minting a specific ERC1155 token IDs
 *         The metadata set through the URI defines the attributes of the tokenized GFV, such as legal information, unitary value, and total supply
 */


contract Tokenize is ERC1155URIStorage, Ownable {
    struct GfvInfo {
        bool exists;
        string tokenName;
        uint totalSupply;
        uint sharePrice;
        string tokenURI;
    }

    mapping (uint256 => GfvInfo) public _gfvTokens;
    bool private _initialized = false;

    event TokenMinted(address to, uint256 tokenId, uint256 amount);

    constructor() ERC1155("") {}

    /**
     * @notice Initializes the contract by minting the GENESIS token and assigning it to the owner
     *         This function can only be called once and only by the contract owner
     * @dev This function represents an Easter egg related to blockchain concepts, as the first token minted is called "GENESIS" similar to the first block of a blockchain
     *      Additionally, the "GENESIS" token will be given the TokenId 0
     */
    function init() external onlyOwner {
        require(!_initialized, "Init has already been called");
        _gfvTokens[0] = GfvInfo(true, "GENESIS", 1, 0, "");
        _mint(msg.sender, 0, 1, "");
        _initialized = true;
    }


///////////////////////////////////////////////// *-- Minting Functions *-- ///////////////////////////////////////////////

    /**
     * @notice Internal function to mint token that will be used in FundRaiser.sol
     * @param _to Address to which the tokens will be minted
     * @param _tokenId ID of the token to be minted
     * @param _amount Number of tokens to mint
     */
    function _mintToken(address _to, uint256 _tokenId, uint256 _amount) internal { 
        require(_gfvTokens[_tokenId].exists, "Token does not exist");
        _mint(_to, _tokenId, _amount, "");

        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.totalSupply += _amount;

        emit TokenMinted(_to, _tokenId, _amount);
    }

    /**
     * @notice Owner can mint token of a spefic tokenID send it to a given address
     *         This function may be useful if we later add a function allowing to freeze a specific token, then allowing 
     *         us to remint the fronzen token without really impacting the effectivetotal supply for an address that 
     *         has violated rules, especially in cases where a token owner has transferred tokens to a non-KYC verified address 
     *         This function can only be called by the contract owner
     * @dev This function should be used cautiously as it can affect the tokenomics
     * @param _to Address to which the tokens will be minted
     * @param _tokenId ID of the token to be minted
     * @param _amount Number of tokens to mint
     */
    function mintTokenEmergency(address _to, uint256 _tokenId, uint256 _amount) external onlyOwner { 
        require(_gfvTokens[_tokenId].exists, "Token does not exist");
        _mint(_to, _tokenId, _amount, "");

        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.totalSupply += _amount;

        emit TokenMinted(_to, _tokenId, _amount);
    }


///////////////////////////////////////////////// *-- GFV Struct Management *-- ///////////////////////////////////////////////

    /**
     * @notice Initializes the GFV information for a specific token ID
     *         This function can only be called by the contract owner
     * @param _tokenId ID of the token
     * @param _sharePrice Price of a token share
     * @param _uri URI of the token
     * @param _tokenName Name of the token
     */
    function initGfvInfoForATokenId(uint _tokenId, uint _sharePrice, string calldata _uri, string calldata _tokenName) external onlyOwner {
        require(!_gfvTokens[_tokenId].exists, "Token already initialized");

        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.exists = true;
        gfvInfoToUpdate.sharePrice = _sharePrice;
        gfvInfoToUpdate.tokenURI = _uri;
        gfvInfoToUpdate.tokenName = _tokenName;
    }

    /**
     * @notice Updates the share price and URI of a specific token
     *         This function can only be called by the contract owner
     * @param _tokenId ID of the token
     * @param _newSharePrice New price of a share of the token
     * @param _newURI New URI of the token
     */
    function updateSharePriceAndUri(uint256 _tokenId, uint _newSharePrice, string memory _newURI) external onlyOwner {
        require(_gfvTokens[_tokenId].exists, "Token does not exist");

        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.sharePrice = _newSharePrice;
        gfvInfoToUpdate.tokenURI = _newURI;
    }

    /**
     * @notice Updates the URI of a specific token
     *         This function can only be called by the contract owner
     * @param _tokenId ID of the token
     * @param _newURI New URI of the token
     */
    function updateTokenURI(uint256 _tokenId, string memory _newURI) external onlyOwner {
        require(_gfvTokens[_tokenId].exists, "Token does not exist");

        _setURI(_tokenId, _newURI);
        
        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.tokenURI = _newURI;
    }
}
