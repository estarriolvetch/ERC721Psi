// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import '../extension/ERC721PsiAddressData.sol';
import '../extension/ERC721PsiBurnable.sol';
import "hardhat/console.sol";

contract ERC721PsiAddressDataBurnableMock is ERC721PsiBurnable, ERC721PsiAddressData {
    
    constructor(string memory name_, string memory symbol_) ERC721Psi(name_, symbol_) {}

    function numberMinted(address user) public view returns(uint256) {
        return balanceOf(user);
    }

    function numberBurned(address owner) 
        public 
        view 
        returns (uint) 
    {
        if (owner == address(0)) revert BalanceQueryForZeroAddress();
        return _numberBurned(owner);   
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
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

    function _afterTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override(ERC721Psi, ERC721PsiAddressData) {
        ERC721PsiAddressData._afterTokenTransfers(from, to, startTokenId, quantity);
    }

    function _exists(uint256 tokenId) internal view override(ERC721Psi, ERC721PsiBurnable) virtual returns (bool){
        return ERC721PsiBurnable._exists(tokenId);
    }
    
    function balanceOf(address owner) 
        public 
        view 
        virtual 
        override(ERC721Psi, ERC721PsiAddressData)
        returns (uint) 
    {
        return ERC721PsiAddressData.balanceOf(owner);
    }

    function ownerOf(uint256 tokenId)
        public
        view
        virtual
        override(ERC721Psi, ERC721PsiBurnable)
        returns (address)
    {
        return ERC721PsiBurnable.ownerOf(tokenId);
    }

    function totalSupply() public view virtual override(ERC721Psi, ERC721PsiBurnable) returns (uint256) {
        return ERC721PsiBurnable.totalSupply();
    }
}