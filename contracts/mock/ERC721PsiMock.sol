// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../ERC721Psi.sol';
import "hardhat/console.sol";


contract ERC721PsiMock is ERC721Psi {
    constructor(string memory name_, string memory symbol_) ERC721Psi(name_, symbol_) {}

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