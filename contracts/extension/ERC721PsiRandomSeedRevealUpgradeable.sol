// SPDX-License-Identifier: MIT
/**
  ______ _____   _____ ______ ___  __ _  _  _ 
 |  ____|  __ \ / ____|____  |__ \/_ | || || |
 | |__  | |__) | |        / /   ) || | \| |/ |
 |  __| |  _  /| |       / /   / / | |\_   _/ 
 | |____| | \ \| |____  / /   / /_ | |  | |   
 |______|_|  \_\\_____|/_/   |____||_|  |_|   
                                              
                                            
 */
pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

import "../interface/IERC721RandomSeed.sol";
import "./ERC721PsiBatchMetaDataUpgradeable.sol";
import {ERC721PsiRandomSeedRevealStorage} from "../storage/ERC721PsiRandomSeedRevealStorage.sol";

abstract contract ERC721PsiRandomSeedRevealUpgradeable is IERC721RandomSeed, ERC721PsiBatchMetaDataUpgradeable, VRFConsumerBaseV2 {
    using ERC721PsiRandomSeedRevealStorage for ERC721PsiRandomSeedRevealStorage.Layout;
    
    // Chainklink VRF V2
    ///@custom:security non-reentrant
    VRFCoordinatorV2Interface immutable COORDINATOR;
    uint32 immutable callbackGasLimit;
    uint16 immutable requestConfirmations;
    uint16 constant NUM_WORDS = 1;
    
    event RandomnessRequest(uint256 requestId);

    error GenerationQueryForNonExistentToken();
    
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
        uint256 genId = ERC721PsiRandomSeedRevealStorage.layout().requestIdToGenId[requestId];
        delete ERC721PsiRandomSeedRevealStorage.layout().requestIdToGenId[genId];
        ERC721PsiRandomSeedRevealStorage.layout().genSeed[genId] = randomness;
        _processRandomnessFulfillment(requestId, genId, randomness);
    }

    function _safeMint(
        address to,
        uint256 quantity,
        bytes memory data
    ) internal virtual override {
        uint256 nextTokenId = _nextTokenId();
        ERC721PsiRandomSeedRevealStorage.layout()._batchHeadtokenGen[nextTokenId] = ERC721PsiRandomSeedRevealStorage.layout().currentGen;
        super._safeMint(to, quantity, data);
    }


    /**
        @dev Query the generation of `tokenId`.
     */
    function _tokenGen(uint256 tokenId) internal view returns (uint256) {
        if(!_exists(tokenId)) revert GenerationQueryForNonExistentToken();
        return ERC721PsiRandomSeedRevealStorage.layout()._batchHeadtokenGen[_getMetaDataBatchHead(tokenId)];
    } 

    /**
        @dev Request the randomess for the tokens of the current generation.
     */
    function _reveal() internal virtual {
        uint256 requestId = COORDINATOR.requestRandomWords(
            _keyHash(),
            _subscriptionId(),
            requestConfirmations,
            callbackGasLimit,
            NUM_WORDS
        );

        emit RandomnessRequest(requestId);
        ERC721PsiRandomSeedRevealStorage.layout().requestIdToGenId[requestId] = ERC721PsiRandomSeedRevealStorage.layout().currentGen;
        _processRandomnessRequest(requestId, ERC721PsiRandomSeedRevealStorage.layout().currentGen);
        ERC721PsiRandomSeedRevealStorage.layout().currentGen++;
    }

    /**
        @dev Return the random seed of `tokenId`.

        Revert when the randomness hasn't been fulfilled.
     */
    function seed(uint256 tokenId) public virtual override view returns (uint256){
        if (!_exists(tokenId)) revert SeedQueryForNonExistentToken();
        
        unchecked {
            uint256 _genSeed = ERC721PsiRandomSeedRevealStorage.layout().genSeed[_tokenGen(tokenId)];
            if(_genSeed == 0) revert RandomnessHasntBeenFulfilled();
            return uint256(keccak256(
                abi.encode(_genSeed, tokenId)
            ));
        }
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

    function _processRandomnessRequest(uint256 requestId, uint256 genId) internal {}

    function _processRandomnessFulfillment(uint256 requestId, uint256 genId, uint256 randomness) internal {}
}

