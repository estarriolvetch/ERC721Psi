// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC721RandomSeed {

    error SeedQueryForNonExistentToken();
    error RandomnessHasntBeenFulfilled();

    function seed(uint256 tokenId) external view returns (uint256);
}