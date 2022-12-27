// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "solidity-bits/contracts/BitMaps.sol";

library ERC721PsiStorage {

    struct Layout {
        // The next token ID to be minted.
        uint256 _currentIndex;
        // Token name
        string _name;
        // Token symbol
        string _symbol;
        // Mapping from token ID to owner address
        mapping(uint256 => address) _owners;
        // Mapping from token ID to approved address.
        mapping(uint256 => address) _tokenApprovals;
        // Mapping from owner to operator approvals
        mapping(address => mapping(address => bool)) _operatorApprovals;
        // stores batchhead
        BitMaps.BitMap _batchHead;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256('ERC721Psi.contracts.storage.ERC721Psi');

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}