// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../extension/ERC721PsiBurnableUpgradeable.sol';
import "hardhat/console.sol";


contract ERC721PsiBurnableMockUpgradeable is ERC721PsiBurnableUpgradeable {

    function __ERC721PsiBurnableMock_init(string memory name_, string memory symbol_) internal onlyInitializingERC721Psi {
        __ERC721Psi_init_unchained(name_, symbol_);
        __ERC721PsiBurnableMock_init_unchained(name_, symbol_);
    }
    
    function __ERC721PsiBurnableMock_init_unchained(string memory, string memory) internal onlyInitializingERC721Psi {}


    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function totalMinted() public view returns(uint256) {
        return super._totalMinted();
    }

    function numberMinted(address user) public view returns(uint256) {
        return balanceOf(user);
    }

    function totalBurned() external view returns (uint256){
        return _burned();
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

    function burn(
        uint256 tokenId
    ) public {
        if (!_exists(tokenId)) revert OwnerQueryForNonexistentToken();
        if (!_isApprovedOrOwner(_msgSenderERC721Psi(), tokenId)) {
             revert TransferCallerNotOwnerNorApproved();
        }
        _burn(tokenId);
    }

    function benchmarkOwnerOf(uint256 tokenId) public view returns (address owner) {
        uint256 gasBefore = gasleft();
        owner = ownerOf(tokenId);
        uint256 gasAfter = gasleft();
        console.log(gasBefore - gasAfter);
    }

    function burn(uint256 start, uint256 num) public {
        uint256 end = start + num;
        for(uint256 i=start;i<end;i++){
            _burn(i);
        }
    }
}