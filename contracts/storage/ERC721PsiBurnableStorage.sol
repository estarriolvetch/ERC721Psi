// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "solady/src/utils/LibBitmap.sol";

library ERC721PsiBurnableStorage {

    struct Layout {
        LibBitmap.Bitmap _burnedToken;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256('ERC721Psi.contracts.storage.Burnable');

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}