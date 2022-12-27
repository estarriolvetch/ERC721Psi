// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './ERC721PsiBurnableMockUpgradeable.sol';
import './StartTokenIdHelperUpgradeable.sol';
import {StartTokenIdHelperStorage} from '../storage/StartTokenIdHelperStorage.sol';
import '../storage/ERC721PsiInitializable.sol';

contract ERC721PsiBurnableStartTokenIdMockUpgradeable is
    ERC721PsiInitializable,
    StartTokenIdHelperUpgradeable,
    ERC721PsiBurnableMockUpgradeable
{
    using StartTokenIdHelperStorage for StartTokenIdHelperStorage.Layout;

    function __ERC721PsiBurnableStartTokenIdMock_init(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) internal onlyInitializingERC721Psi {
        __StartTokenIdHelper_init_unchained(startTokenId_);
        __ERC721Psi_init_unchained(name_, symbol_);
        __ERC721PsiBurnableMock_init_unchained(name_, symbol_);
        __ERC721PsiBurnableStartTokenIdMock_init_unchained(name_, symbol_, startTokenId_);
    }

    function __ERC721PsiBurnableStartTokenIdMock_init_unchained(
        string memory,
        string memory,
        uint256
    ) internal onlyInitializingERC721Psi {}

    function _startTokenId() internal view override returns (uint256) {
        return StartTokenIdHelperStorage.layout().startTokenId;
    }
}