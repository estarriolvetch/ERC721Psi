// SPDX-License-Identifier: MIT
pragma solidity >=0.7 <0.9;
pragma experimental ABIEncoderV2;

import '../ERC721PsiUpgradeable.sol';

contract ERC721PsiUpgradeableWithInit is ERC721PsiUpgradeable {
    constructor(string memory name_, string memory symbol_) payable initializerERC721Psi {
        __ERC721Psi_init(name_, symbol_);
    }
}


import './ERC721PsiMockUpgradeable.sol';

contract ERC721PsiMockUpgradeableWithInit is ERC721PsiMockUpgradeable {
    constructor(string memory name_, string memory symbol_) payable initializerERC721Psi {
        __ERC721PsiMock_init(name_, symbol_);
    }
}


import './ERC721PsiStartTokenIdMockUpgradeable.sol';

contract ERC721PsiStartTokenIdMockUpgradeableWithInit is ERC721PsiStartTokenIdMockUpgradeable {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) payable initializerERC721Psi {
        __ERC721PsiStartTokenIdMock_init(name_, symbol_, startTokenId_);
    }
}


import './StartTokenIdHelperUpgradeable.sol';

contract StartTokenIdHelperUpgradeableWithInit is StartTokenIdHelperUpgradeable {
    constructor(uint256 startTokenId_) payable initializerERC721Psi {
        __StartTokenIdHelper_init(startTokenId_);
    }
}


import './ERC721PsiBurnableMockUpgradeable.sol';

contract ERC721PsiBurnableMockUpgradeableWithInit is ERC721PsiBurnableMockUpgradeable {
    constructor(string memory name_, string memory symbol_) payable initializerERC721Psi {
        __ERC721PsiBurnableMock_init(name_, symbol_);
    }
}


import './ERC721PsiBurnableStartTokenIdMockUpgradeable.sol';

contract ERC721PsiBurnableStartTokenIdMockUpgradeableWithInit is ERC721PsiBurnableStartTokenIdMockUpgradeable {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) payable initializerERC721Psi {
        __ERC721PsiBurnableStartTokenIdMock_init(name_, symbol_, startTokenId_);
    }
}


import './ERC721PsiGasReporterMockUpgradeable.sol';

contract ERC721PsiGasReporterMockUpgradeableWithInit is ERC721PsiGasReporterMockUpgradeable {
    constructor(
        string memory name_,
        string memory symbol_
    ) payable initializerERC721Psi {
        __ERC721PsiGasReporterMock_init(name_, symbol_);
    }
}