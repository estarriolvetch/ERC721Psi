// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../extension/ERC721PsiAddressData.sol';
import "hardhat/console.sol";

contract ERC721PsiAddressDataMock is ERC721PsiAddressData {
    
    constructor(string memory name_, string memory symbol_) ERC721Psi(name_, symbol_) {}

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function safeMint(
        address to,
        uint256 quantity,
        bytes memory data
    ) public {
        _safeMint(to, quantity, data);
    }

    function getBatchHead(
        uint256 tokenId
    ) public view {
        _getBatchHead(tokenId);
    }

    function numberMinted(address owner) 
        public 
        view 
        returns (uint) 
    {
        if (owner == address(0)) revert BalanceQueryForZeroAddress();
        return _numberMinted(owner);   
    }

    function benchmarkOwnerOf(uint256 tokenId) public view returns (address owner) {
        uint256 gasBefore = gasleft();
        owner = ownerOf(tokenId);
        uint256 gasAfter = gasleft();
        console.log(gasBefore - gasAfter);
    }
}