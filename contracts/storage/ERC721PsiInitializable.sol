// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721PsiInitializableStorage} from "./ERC721PsiInitializableStorage.sol";

/**
 * @dev This is a base contract to aid in writing upgradeable diamond facet contracts, or any kind of contract that will be deployed
 * behind a proxy. Since proxied contracts do not make use of a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {ERC1967Proxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 */

abstract contract ERC721PsiInitializable {
    using ERC721PsiInitializableStorage for ERC721PsiInitializableStorage.Layout;

    /**
     * @dev Modifier to protect an initializer function from being invoked twice.
     */
    modifier initializerERC721Psi() {
        // If the contract is initializing we ignore whether _initialized is set in order to support multiple
        // inheritance patterns, but we only do this in the context of a constructor, because in other contexts the
        // contract may have been reentered.
        require(
            ERC721PsiInitializableStorage.layout()._initializing
                ? _isConstructor()
                : !ERC721PsiInitializableStorage.layout()._initialized,
            'ERC721Psi__Initializable: contract is already initialized'
        );

        bool isTopLevelCall = !ERC721PsiInitializableStorage.layout()._initializing;
        if (isTopLevelCall) {
            ERC721PsiInitializableStorage.layout()._initializing = true;
            ERC721PsiInitializableStorage.layout()._initialized = true;
        }

        _;

        if (isTopLevelCall) {
            ERC721PsiInitializableStorage.layout()._initializing = false;
        }
    }

    /**
     * @dev Modifier to protect an initialization function so that it can only be invoked by functions with the
     * {initializer} modifier, directly or indirectly.
     */
    modifier onlyInitializingERC721Psi() {
        require(
            ERC721PsiInitializableStorage.layout()._initializing,
            'ERC721PsiInitializable: contract is not initializing'
        );
        _;
    }

    /// @dev Returns true if and only if the function is running in the constructor
    function _isConstructor() private view returns (bool) {
        // extcodesize checks the size of the code stored in an address, and
        // address returns the current address. Since the code is still not
        // deployed when running a constructor, any checks on its code size will
        // yield zero, making it an effective way to detect if a contract is
        // under construction or not.
        address self = address(this);
        uint256 cs;
        assembly {
            cs := extcodesize(self)
        }
        return cs == 0;
    }
}
