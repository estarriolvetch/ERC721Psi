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

/**
    @dev This extension follows the AddressData format of ERC721A, so
    it can be a dropped-in replacement for the contract that requires AddressData
*/ 
abstract contract ERC721PsiAddressData is ERC721Psi {

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
    mapping(address => uint256) private _packedAddressData;

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
        return _packedAddressData[owner] & (1 << 64) - 1;
    }

    /**
     * Returns the number of tokens minted by `owner`.
     */
    function _numberMinted(address owner) internal view returns (uint256) {
        return (_packedAddressData[owner] >> 64) & (1 << 64) - 1;
    }

    /**
     * Returns the number of tokens burned by or on behalf of `owner`.
     */
    function _numberBurned(address owner) internal view returns (uint256) {
        return (_packedAddressData[owner] >> 128) & (1 << 64) - 1;
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

        unchecked {
            if(to != address(0)){
                if (from == address(0)) {
                    // Mint
                    _packedAddressData[to] += quantity * ((1 << 64) | 1);
                }
                else {
                    //Transfer
                    _packedAddressData[to] += quantity;
                    _packedAddressData[from] -= quantity;
                }
            } 
            else {
                // Burn
                _packedAddressData[from] += (quantity << 128) - quantity;
            }
        }
        super._afterTokenTransfers(from, to, startTokenId, quantity);
    }
}
