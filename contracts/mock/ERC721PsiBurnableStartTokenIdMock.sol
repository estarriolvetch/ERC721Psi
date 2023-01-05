// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './ERC721PsiBurnableMock.sol';
import './StartTokenIdHelper.sol';

contract ERC721PsiBurnableStartTokenIdMock is StartTokenIdHelper, ERC721PsiBurnableMock {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) StartTokenIdHelper(startTokenId_) ERC721PsiBurnableMock(name_, symbol_) {}

    function _startTokenId() internal view override returns (uint256) {
        return startTokenId;
    }
}