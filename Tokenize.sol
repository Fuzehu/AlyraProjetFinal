// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

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
    mapping (address => bool) public _mintTokenFunctionAuthorizedContracts;
    event TokenMinted(address to, uint256 tokenId, uint256 amount);
    constructor() ERC1155("") {}
    function init() external onlyOwner {
        require(!_initialized, "Init has already been called");
        _gfvTokens[0] = GfvInfo(true, "GENESIS", 1, 0, "");
        _mint(msg.sender, 0, 1, "");
        _initialized = true;
    }
    function authorizeContract(address contractAddress) external onlyOwner {
        require(!_mintTokenFunctionAuthorizedContracts[contractAddress], "Contract is already authorized");
        _mintTokenFunctionAuthorizedContracts[contractAddress] = true;
    }
    function revokeContract(address contractAddress) external onlyOwner {
        require(_mintTokenFunctionAuthorizedContracts[contractAddress], "Contract is not authorized");
        _mintTokenFunctionAuthorizedContracts[contractAddress] = false;
    }
    function _mintToken(address _to, uint256 _tokenId, uint256 _amount) public { 
        require(_mintTokenFunctionAuthorizedContracts[msg.sender], "Caller is not authorized");
        require(_gfvTokens[_tokenId].exists, "Token does not exist");
        _mint(_to, _tokenId, _amount, "");
        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.totalSupply += _amount;
        emit TokenMinted(_to, _tokenId, _amount);
    }
    function mintTokenEmergency(address _to, uint256 _tokenId, uint256 _amount) external onlyOwner { 
        require(_gfvTokens[_tokenId].exists, "Token does not exist");
        _mint(_to, _tokenId, _amount, "");
        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.totalSupply += _amount;
        emit TokenMinted(_to, _tokenId, _amount);
    }
    function initGfvInfoForATokenId(uint _tokenId, uint _sharePrice, string calldata _uri, string calldata _tokenName) external onlyOwner {
        require(!_gfvTokens[_tokenId].exists, "Token already initialized");
        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.exists = true;
        gfvInfoToUpdate.sharePrice = _sharePrice;
        gfvInfoToUpdate.tokenURI = _uri;
        gfvInfoToUpdate.tokenName = _tokenName;
    }
    function updateSharePriceAndUri(uint256 _tokenId, uint _newSharePrice, string memory _newURI) external onlyOwner {
        require(_gfvTokens[_tokenId].exists, "Token does not exist");
        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.sharePrice = _newSharePrice;
        gfvInfoToUpdate.tokenURI = _newURI;
    }
    function updateTokenURI(uint256 _tokenId, string memory _newURI) external onlyOwner {
        require(_gfvTokens[_tokenId].exists, "Token does not exist");
        _setURI(_tokenId, _newURI);
        GfvInfo storage gfvInfoToUpdate = _gfvTokens[_tokenId];
        gfvInfoToUpdate.tokenURI = _newURI;
    }
}
