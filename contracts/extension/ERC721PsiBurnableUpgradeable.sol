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

import "solady/src/utils/LibBitmap.sol";
import "../ERC721PsiUpgradeable.sol";
import {ERC721PsiBurnableStorage} from "../storage/ERC721PsiBurnableStorage.sol";

abstract contract ERC721PsiBurnableUpgradeable is ERC721PsiUpgradeable {
    using ERC721PsiBurnableStorage for ERC721PsiBurnableStorage.Layout;
    using LibBitmap for LibBitmap.Bitmap;

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(uint256 tokenId) internal virtual {
        address from = ownerOf(tokenId);
        _beforeTokenTransfers(from, address(0), tokenId, 1);
        ERC721PsiBurnableStorage.layout()._burnedToken.set(tokenId);
        
        emit Transfer(from, address(0), tokenId);

        _afterTokenTransfers(from, address(0), tokenId, 1);
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(uint256 tokenId) internal view override virtual returns (bool){
        if(ERC721PsiBurnableStorage.layout()._burnedToken.get(tokenId)) {
            return false;
        } 
        return super._exists(tokenId);
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        if (ERC721PsiBurnableStorage.layout()._burnedToken.get(tokenId)) {
            return address(0);
        }
        else {
            return super.ownerOf(tokenId);
        }
    }

    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
         return _totalMinted() - _burned();
    }

    /**
     * @dev Returns number of token burned.
     */
    function _burned() internal view returns (uint256 burned){
      return ERC721PsiBurnableStorage.layout()._burnedToken.popCount( _startTokenId(), _totalMinted());
    }
}