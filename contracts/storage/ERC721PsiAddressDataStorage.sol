// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


library ERC721PsiAddressDataStorage {

    struct Layout {
        // Mapping owner address to address data.
        //
        // Bits Layout:
        //
        // Realistically, 2**64-1 is more than enough.
        // - [0..63]    `balance`
        //
        // Keeps track of mint count with minimal overhead for tokenomics.
        // - [64..127]  `numberMinted`
        //
        // Keeps track of burn count with minimal overhead for tokenomics.
        // - [128..191] `numberBurned`
        //
        // For miscellaneous variable(s) pertaining to the address
        // (e.g. number of whitelist mint slots used).
        // If there are multiple variables, please pack them into a uint64.
        // - [192..255] `aux`
        mapping(address => uint256) _packedAddressData;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256('ERC721Psi.contracts.storage.AddressData');

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}