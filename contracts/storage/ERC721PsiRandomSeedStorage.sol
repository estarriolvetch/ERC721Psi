// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

library ERC721PsiRandomSeedStorage {

    struct Layout {
        mapping(uint256 => uint256) requestIdToTokenId;
        mapping(uint256 => uint256) batchSeed;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256('ERC721Psi.contracts.storage.RandomSeedReveal');

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}