// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../BitScan.sol";
import "hardhat/console.sol";


contract BitScanMock{

    function isolateLS1B256(uint256 bb) pure public returns (uint256) {
        return BitScan.isolateLS1B256(bb);
    } 

    function isolateMS1B256(uint256 bb) pure public returns (uint256) {
        return BitScan.isolateMS1B256(bb);
    } 

    function bitScanForward256(uint256 bb) pure public returns (uint8) {
        return BitScan.bitScanForward256(bb);  
    }

    function bitScanForward256Iterate(uint256 bb) pure public returns (uint8) {
        uint8 i;
        require(bb > 0);
        while(true) {
            if((bb >> i) & 1 > 0) {
                return i;
            } else {
                unchecked {
                    i++;
                }
            }
        }
    }

    function bitScanReverse256(uint256 bb) pure public returns (uint8) {
        return BitScan.bitScanReverse256(bb);
    }

    function benchmarkBitScanForward256(uint256 bb) public returns (uint8) {
        uint256 gasBefore = gasleft();
        uint8 r = bitScanForward256(bb);
        uint256 gasAfter = gasleft();
        console.log(gasBefore - gasAfter);
        return r;
    }

    function benchmarkBitScanForward256Iterate(uint256 bb) public returns (uint8) {
        uint256 gasBefore = gasleft();
        uint8 r = bitScanForward256Iterate(bb);
        uint256 gasAfter = gasleft();
        console.log(gasBefore - gasAfter);
        return r;
    }


}


