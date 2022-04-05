// SPDX-License-Identifier: MIT

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import 'hardhat/console.sol';

contract ERC721EnumerableMock is ERC721Enumerable {
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function safeMintBatch(address to, uint256 quantity) public {
        uint256 _totalSupply = totalSupply();
        for(uint256 i = _totalSupply; i < (_totalSupply + quantity); i++) {
            _safeMint(to, i);
        }
    }

    function safeMint(
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public {
        _safeMint(to, tokenId, _data);
    }



    function benchmarkOwnerOf(uint256 tokenId) public returns (address owner) {
        uint256 gasBefore = gasleft();
        owner = ownerOf(tokenId);
        uint256 gasAfter = gasleft();
        console.log(gasBefore - gasAfter);
    }

    function burn(uint256 start, uint256 num) public {
        uint256 end = start + num;
        for(uint256 i=start;i<end;i++){
            _burn(i);
        }
    }
}