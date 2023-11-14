// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../extension/ERC721PsiRandomSeedRevealUpgradeable.sol';
import "hardhat/console.sol";


contract ERC721PsiRandomSeedRevealUpgradeableMock is ERC721PsiRandomSeedRevealUpgradeable {
    uint64 immutable subId;

    constructor(address coordinator_, uint64 _subId) 
        ERC721PsiRandomSeedRevealUpgradeable(
            coordinator_,
            100000,
            10
        )
        {
            subId = _subId;
        }

    function initialize(string memory name_, string memory symbol_) public initializerERC721Psi  {
        __ERC721PsiRandomSeedRevealMock_init(name_, symbol_);
    }
    
    function __ERC721PsiRandomSeedRevealMock_init(string memory name_, string memory symbol_) internal onlyInitializingERC721Psi {
        __ERC721Psi_init_unchained(name_, symbol_);
        __ERC721PsiRandomSeedRevealMock_init_unchained(name_, symbol_);
    }
    
    function __ERC721PsiRandomSeedRevealMock_init_unchained(string memory, string memory) internal onlyInitializingERC721Psi {}

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
        bytes memory data
    ) public {
        _safeMint(to, quantity, data);
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

    function tokenGen(uint256 tokenId) public view returns (uint256) {
        _tokenGen(tokenId);
    } 

    function reveal() public {
        _reveal();
    }

    function benchmarkOwnerOf(uint256 tokenId) public returns (address owner) {
        uint256 gasBefore = gasleft();
        owner = ownerOf(tokenId);
        uint256 gasAfter = gasleft();
        console.log(gasBefore - gasAfter);
    }
}