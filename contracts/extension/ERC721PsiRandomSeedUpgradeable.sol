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

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

import "../interface/IERC721RandomSeed.sol";
import "./ERC721PsiBatchMetaDataUpgradeable.sol";
import {ERC721PsiRandomSeedStorage} from "../storage/ERC721PsiRandomSeedStorage.sol";

abstract contract ERC721PsiRandomSeedUpgradeable is IERC721RandomSeed, ERC721PsiBatchMetaDataUpgradeable, VRFConsumerBaseV2 {
    using ERC721PsiRandomSeedStorage for ERC721PsiRandomSeedStorage.Layout;
    
    // Chainklink VRF V2
    VRFCoordinatorV2Interface immutable COORDINATOR;
    uint32 immutable callbackGasLimit;
    uint16 immutable requestConfirmations;
    uint16 constant numWords = 1;

    event RandomnessRequest(uint256 requestId);
    
    constructor(
        address coordinator,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) VRFConsumerBaseV2(coordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(coordinator);
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 randomness = randomWords[0];
        uint256 tokenIdHead = ERC721PsiRandomSeedStorage.layout().requestIdToTokenId[requestId];
        delete ERC721PsiRandomSeedStorage.layout().requestIdToTokenId[requestId];
        ERC721PsiRandomSeedStorage.layout().batchSeed[tokenIdHead] = randomness;
        _processRandomnessFulfillment(requestId, tokenIdHead, randomness);
    }

    function _safeMint(
        address to,
        uint256 quantity,
        bytes memory _data
    ) internal virtual override {
        uint256 nextTokenId = _nextTokenId();

        uint256 requestId = COORDINATOR.requestRandomWords(
            _keyHash(),
            _subscriptionId(),
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        emit RandomnessRequest(requestId);
        ERC721PsiRandomSeedStorage.layout().requestIdToTokenId[requestId] = nextTokenId;
        super._safeMint(to, quantity, _data);
        _processRandomnessRequest(requestId, nextTokenId);
    }

    /** 
        @dev Override the function to provide the corrosponding keyHash for the Chainlink VRF V2.

        see also: https://docs.chain.link/docs/vrf-contracts/
     */
    function _keyHash() internal virtual returns (bytes32); 
    
    /** 
        @dev Override the function to provide the corrosponding subscription id for the Chainlink VRF V2.

        see also: https://docs.chain.link/docs/get-a-random-number/#create-and-fund-a-subscription
     */
    function _subscriptionId() internal virtual returns (uint64);

    function _processRandomnessRequest(uint256 requestId, uint256 tokenIdHead) internal {}

    function _processRandomnessFulfillment(uint256 requestId, uint256 tokenIdHead, uint256 randomness) internal {}

    /**
        @dev Return the random seed of `tokenId`.

        Revert when the randomness hasn't been fulfilled.
     */
    function seed(uint256 tokenId) public virtual override view returns (uint256){
        if (!_exists(tokenId)) revert SeedQueryForNonExistentToken();
        uint256 tokenIdMetaDataBatchHead = _getMetaDataBatchHead(tokenId);

        unchecked {
            uint256 _batchSeed = ERC721PsiRandomSeedStorage.layout().batchSeed[tokenIdMetaDataBatchHead];
            if(_batchSeed == 0) revert RandomnessHasntBeenFulfilled();
            return uint256(keccak256(
                abi.encode(_batchSeed, tokenId)
            ));
        }
    }
}
