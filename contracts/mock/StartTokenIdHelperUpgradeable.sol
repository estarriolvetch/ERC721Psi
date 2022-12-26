// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {StartTokenIdHelperStorage} from './StartTokenIdHelperStorage.sol';
import '../ERC721PsiInitializable.sol';

/**
 * This Helper is used to return a dynamic value in the overridden _startTokenId() function.
 * Extending this Helper before the ERC721Psi contract give us access to the herein set `startTokenId`
 * to be returned by the overridden `_startTokenId()` function of ERC721Psi in the ERC721PsiStartTokenId mocks.
 */
contract StartTokenIdHelperUpgradeable is ERC721PsiInitializable {
    using StartTokenIdHelperStorage for StartTokenIdHelperStorage.Layout;

    function __StartTokenIdHelper_init(uint256 startTokenId_) internal onlyInitializingERC721Psi {
        __StartTokenIdHelper_init_unchained(startTokenId_);
    }

    function __StartTokenIdHelper_init_unchained(uint256 startTokenId_) internal onlyInitializingERC721Psi {
        StartTokenIdHelperStorage.layout().startTokenId = startTokenId_;
    }

    // generated getter for ${varDecl.name}
    function startTokenId() public view returns (uint256) {
        return StartTokenIdHelperStorage.layout().startTokenId;
    }
}