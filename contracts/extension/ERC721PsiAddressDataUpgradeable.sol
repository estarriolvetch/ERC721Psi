// SPDX-License-Identifier: MIT
/**
  ______ _____   _____ ______ ___  __ _  _  _ 
 |  ____|  __ \ / ____|____  |__ \/_ | || || |
 | |__  | |__) | |        / /   ) || | \| |/ |
 |  __| |  _  /| |       / /   / / | |\_   _/ 
 | |____| | \ \| |____  / /   / /_ | |  | |   
 |______|_|  \_\\_____|/_/   |____||_|  |_|   
                                              
                                            
 */
pragma solidity ^0.8.0;

import "solidity-bits/contracts/BitMaps.sol";
import "../ERC721PsiUpgradeable.sol";
import {ERC721PsiAddressDataStorage} from "../storage/ERC721PsiAddressDataStorage.sol";

abstract contract ERC721PsiAddressDataUpgradeable is ERC721PsiUpgradeable {
    using ERC721PsiAddressDataStorage for ERC721PsiAddressDataStorage.Layout;   

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) 
        public 
        view 
        virtual 
        override 
        returns (uint) 
    {
        if (owner == address(0)) revert BalanceQueryForZeroAddress();
        return uint256(ERC721PsiAddressDataStorage.layout()._addressData[owner].balance);   
    }

    /**
     * @dev Hook that is called after a set of serially-ordered token ids have been transferred. This includes
     * minting.
     *
     * startTokenId - the first token id to be transferred
     * quantity - the amount to be transferred
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero.
     * - `from` and `to` are never both zero.
     */
    function _afterTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal override virtual {
        require(quantity < 2 ** 64);
        uint64 _quantity = uint64(quantity);

        if(from != address(0)){
            ERC721PsiAddressDataStorage.layout()._addressData[from].balance -= _quantity;
        } else {
            // Mint
            ERC721PsiAddressDataStorage.layout()._addressData[to].numberMinted += _quantity;
        }

        if(to != address(0)){
            ERC721PsiAddressDataStorage.layout()._addressData[to].balance += _quantity;
        } else {
            // Burn
            ERC721PsiAddressDataStorage.layout()._addressData[from].numberBurned += _quantity;
        }
        super._afterTokenTransfers(from, to, startTokenId, quantity);
    }
}