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


import "../ERC721PsiUpgradeable.sol";
import {ERC721PsiBatchMetaDataStorage} from "../storage/ERC721PsiBatchMetaDataStorage.sol";

abstract contract ERC721PsiBatchMetaDataUpgradeable is ERC721PsiUpgradeable {
    using ERC721PsiBatchMetaDataStorage for ERC721PsiBatchMetaDataStorage.Layout;
    using LibBitmap for LibBitmap.Bitmap;

    function _safeMint(
        address to,
        uint256 quantity,
        bytes memory data
    ) internal virtual override {
        ERC721PsiBatchMetaDataStorage.layout()._metaDataBatchHead.set(_nextTokenId());
        super._safeMint(to, quantity, data);
    }

    /**
     *  @dev Return the batch head tokenId where the on-chain metadata is stored during minting.
     *
     *  The returned tokenId will remain the same after the token transfer.
     */
    function _getMetaDataBatchHead(uint256 tokenId) internal view returns (uint256 tokenIdMetaDataBatchHead) {
        tokenIdMetaDataBatchHead = ERC721PsiBatchMetaDataStorage.layout()._metaDataBatchHead.findLastSet(tokenId);
    }
}