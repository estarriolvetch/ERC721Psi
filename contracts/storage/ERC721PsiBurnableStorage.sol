// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "solidity-bits/contracts/BitMaps.sol";

library ERC721PsiBurnableStorage {
    using BitMaps for BitMaps.BitMap;

    struct Layout {
        BitMaps.BitMap _burnedToken;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256('ERC721Psi.contracts.storage.Burnable');

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}