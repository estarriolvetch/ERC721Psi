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
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "fpe-map/contracts/FPEMap.sol";

import "../ERC721Psi.sol";

abstract contract ERC721PsiMysteryBox is VRFConsumerBaseV2, ERC721Psi {
    using Strings for uint256;

    uint32 private constant _callbackGasLimit = 200000;

    uint256 private seed;

    event RandomnessRequest(uint256 requestId);


    constructor() {
        VRFConsumerBaseV2(_coordinator());
    }

    /**
     * @dev The metadata URI before revealing.
     */
    function _unrevealedURI() internal pure virtual returns (string memory) {
        return "";
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Psi: URI query for nonexistent token");

        if(seed == 0) {
            return _unrevealedURI();
        }

        string memory baseURI = _baseURI();

        uint256 metadataId = FPEMap.fpeMappingFeistelAuto(tokenId, seed, _maxSupply()); 
        
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, 
            metadataId.toString()
        )) : "";
    }

    
    /** 
        @dev Override the function to provide the maxium supply of the collection. It should be a constant value.

        see also: https://docs.chain.link/docs/vrf-contracts/
     */
    function _maxSupply() internal pure virtual returns (uint256);


    /** 
        @dev Override the function to provide the address of the VRF coordinatr for the Chainlink VRF V2.

        see also: https://docs.chain.link/docs/vrf-contracts/
     */
    function _coordinator() internal virtual returns (address); 


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


    /** 
        @dev Required block confirmations before the VRF callback.

        see also: https://docs.chain.link/docs/vrf-contracts/
     */
    function _requestConfirmations() internal virtual returns (uint16) {
        return 10;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        require(seed == 0, "Already revealed");
        seed = randomWords[0];
    }


    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal override virtual {
        if(from == address(0)) {
            require(startTokenId + quantity < _maxSupply(), "Exceed maximum supply!");
        }
        super._beforeTokenTransfers(from, to, startTokenId, quantity);
    }

    /**
        @dev Call this function when you want to reveal the mystery box.
     */
    function _reveal() internal virtual {
        require(seed == 0, "Already revealed");

        uint256 requestId = VRFCoordinatorV2Interface(_coordinator()).requestRandomWords(
            _keyHash(),
            _subscriptionId(),
            _requestConfirmations(),
            _callbackGasLimit,
            1
        );

        emit RandomnessRequest(requestId);
    }

}