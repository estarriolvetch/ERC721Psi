// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../extension/ERC721PsiRandomSeed.sol';
import "hardhat/console.sol";


contract ERC721PsiRandomSeedMock is ERC721PsiRandomSeed {
    uint64 immutable subId;
    constructor(string memory name_, string memory symbol_, address coordinator_, uint64 _subId) 
        ERC721Psi(name_, symbol_) 
        ERC721PsiRandomSeed(
            coordinator_,
            100000,
            10
        )
        {
            subId = _subId;
        }

    function _keyHash() internal override returns (bytes32){
        return bytes32(0);
    }
    function _subscriptionId() internal override returns (uint64) {
        return subId;
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
    ) public view returns (uint256){
        return _getBatchHead(tokenId);
    }

    function getMetaDataBatchHead(
        uint256 tokenId
    ) public view returns (uint256) {
        return _getMetaDataBatchHead(tokenId);
    }

    function benchmarkOwnerOf(uint256 tokenId) public returns (address owner) {
        uint256 gasBefore = gasleft();
        owner = ownerOf(tokenId);
        uint256 gasAfter = gasleft();
        console.log(gasBefore - gasAfter);
    }

    
}