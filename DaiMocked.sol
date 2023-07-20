// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


    /**
    * @title DaiMocked Contract
    * @author Nicolas Foti
    * @dev Mocked version of DAI, necessary for @FundRaiser unit testing
    */


contract DaiMocked is ERC20, Ownable {

    constructor () ERC20('DaiMocked', 'DAI') {}

    function mint(address _to, uint _amount) external{
        _mint(_to, _amount);
    }
}