// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

library ERC721PsiRandomSeedRevealStorage {

    struct Layout {
        // requestId => genId
        mapping(uint256 => uint256) requestIdToGenId;
        // genId => seed
        mapping(uint256 => uint256) genSeed;
        // batchHeadTokenId => genId
        mapping(uint256 => uint256) _batchHeadtokenGen;
        // current genId for minting
        uint256 currentGen;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256('ERC721Psi.contracts.storage.RandomSeedReveal');

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}