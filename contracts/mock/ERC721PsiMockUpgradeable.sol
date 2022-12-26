// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../ERC721PsiUpgradeable.sol';
import '../ERC721PsiInitializable.sol';
import "hardhat/console.sol";


contract ERC721PsiMockUpgradeable is ERC721PsiInitializable, ERC721PsiUpgradeable {
    
    
    function initialize(
        string memory name_, 
        string memory symbol_
    ) initializerERC721Psi external {
        __ERC721PsiMock_init(name_, symbol_);
    }

    function __ERC721PsiMock_init(string memory name_, string memory symbol_) internal onlyInitializingERC721Psi {
        __ERC721Psi_init_unchained(name_, symbol_);
        __ERC721PsiMock_init_unchained(name_, symbol_);
    }
    
    function __ERC721PsiMock_init_unchained(string memory, string memory) internal onlyInitializingERC721Psi {}

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
        bytes memory _data
    ) public {
        _safeMint(to, quantity, _data);
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