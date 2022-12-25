// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../ERC721PsiUpgradeable.sol';
import "hardhat/console.sol";


contract ERC721PsiMockUpgradeable is ERC721PsiUpgradeable {

    function initialize(
        string memory name_, 
        string memory symbol_
    ) initializer external {
        __ERC721Psi_init(name_, symbol_);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 0;
    }

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
        bytes memory _data
    ) public {
        _safeMint(to, quantity, _data);
    }

    function getBatchHead(
        uint256 tokenId
    ) public view {
        _getBatchHead(tokenId);
    }


    function benchmarkOwnerOf(uint256 tokenId) public returns (address owner) {
        uint256 gasBefore = gasleft();
        owner = ownerOf(tokenId);
        uint256 gasAfter = gasleft();
        console.log(gasBefore - gasAfter);
    }
}