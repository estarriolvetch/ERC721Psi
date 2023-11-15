// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import './ERC721PsiAddressDataMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721PsiAddressDataStartTokenIdMock is StartTokenIdHelper, ERC721PsiAddressDataMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) StartTokenIdHelper(startTokenId_) ERC721PsiAddressDataMock(name_, symbol_) {}

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId;
    }
}