// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../ERC721Psi.sol';
import "hardhat/console.sol";


contract ERC721PsiMock is ERC721Psi {
    constructor(string memory name_, string memory symbol_) ERC721Psi(name_, symbol_) {}


    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function totalMinted() public view returns(uint256) {
        return super._totalMinted();
    }

    function numberMinted(address user) public view returns(uint256) {
        return balanceOf(user);
    }

    function nextTokenId() public view returns(uint256) {
        return super._nextTokenId();
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

    function mint(address to, uint256 quantity) public {
        _mint(to, quantity);
    }
    
    function getBatchHead(
        uint256 tokenId
    ) public view {
        _getBatchHead(tokenId);
    }

    function directApprove(address to, uint256 tokenId) public {
        _approve(to, tokenId);
    }

    function benchmarkOwnerOf(uint256 tokenId) public view returns (address owner) {
        uint256 gasBefore = gasleft();
        owner = ownerOf(tokenId);
        uint256 gasAfter = gasleft();
        console.log(gasBefore - gasAfter);
    }
}