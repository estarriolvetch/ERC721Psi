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


import "../ERC721Psi.sol";
import "solady/src/utils/LibBitmap.sol";

abstract contract ERC721PsiBatchMetaData is ERC721Psi {
    using LibBitmap for LibBitmap.Bitmap;
    LibBitmap.Bitmap private _metaDataBatchHead;

    function _safeMint(
        address to,
        uint256 quantity,
        bytes memory data
    ) internal virtual override {
        _metaDataBatchHead.set(_nextTokenId());
        super._safeMint(to, quantity, data);
    }

    /**
     *  @dev Return the batch head tokenId where the on-chain metadata is stored during minting.
     *
     *  The returned tokenId will remain the same after the token transfer.
     */
    function _getMetaDataBatchHead(uint256 tokenId) internal view returns (uint256 tokenIdMetaDataBatchHead) {
        tokenIdMetaDataBatchHead = _metaDataBatchHead.findLastSet(tokenId);
    }
}