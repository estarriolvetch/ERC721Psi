# ERC721Psi
[![Node.js CI](https://github.com/estarriolvetch/ERC721Psi/actions/workflows/node.js.yml/badge.svg)](https://github.com/estarriolvetch/ERC721Psi/actions/workflows/node.js.yml)
[![Publish Package to npmjs](https://github.com/estarriolvetch/ERC721Psi/actions/workflows/deploy_npm.yml/badge.svg)](https://github.com/estarriolvetch/ERC721Psi/actions/workflows/deploy_npm.yml)
[![Build Documentation](https://github.com/estarriolvetch/ERC721Psi/actions/workflows/make_docs.yml/badge.svg)](https://github.com/estarriolvetch/ERC721Psi/actions/workflows/make_docs.yml)
[![npm version](https://badge.fury.io/js/erc721psi.svg)](https://www.npmjs.com/package/erc721psi)

**ERC721Psi is releasd under MIT opensource licence and free to use. If you need commercial support/service regarding ERC721Psi, feel free to contact [ctor.xyz](https://ctor.xyz)**


ERC721Psi is an ERC721 compilant implementation designed for scalable and gas-efficient on-chain application with built-in randomized metadata generation. Inspired by AzukiZen's awesome ERC721A, ERC721Psi also provides batch minting at a fixed gas cost. However, ERC721Psi manages to solve the [scaling issue of token transfer](https://github.com/chiru-labs/ERC721A/issues/145) through the mathematical power of the [de Bruijn sequence](https://en.wikipedia.org/wiki/De_Bruijn_sequence).

Powered by Chainlink's VRF V2, ERC721Psi comes with an extension that can batch mint multiple tokens with tamper-proof on-chain random attributes while retaining the fixed minting gas cost.

Litepaper: https://mirror.xyz/ctor.xyz/zy3TUWuJFSeWyMWAucTRP45o-sVToKTrtDsUIiD_m48

Slides: https://www.slideshare.net/EstarriolVetch/erc721psi

Docs: https://estarriolvetch.github.io/ERC721Psi/
## Installaion
### npm
```
npm install --save-dev erc721psi
```
### yarn
```
yarn add --dev erc721psi
```
## Usage
```solidity
pragma solidity ^0.8.0;

import "erc721psi/contracts/ERC721Psi.sol";

contract Adventurer is ERC721Psi {

    constructor() 
        ERC721Psi ("Adventurer", "ADVENTURER"){
    }

    function mint(uint256 quantity) external payable {
        // _safeMint's second argument now takes in a quantity, not a tokenId. (same as ERC721A)
        _safeMint(msg.sender, quantity);
    }

}
```

## Random Seed Extension
The random seed extensions provide an easy way for NFT projects to create on-chain randomized metata at the individual token level. The random seed extensions uses Chainlink's VRF V2 as its source of randomness. Each token comes with its own unique seed that can be used to derived its attributes.
```solidity
interface IERC721RandomSeed {
    function seed(uint256 tokenId) external view returns (uint256);
}
```
There are two types of random seed extensions with different schemes of requesting randomness. 
- `ERC721PsiRandomSeed`: The randomness is requested during minting. There is no extra actions required for the project owner to reveal the token. The random seeds of the tokens will be revealed when the randomness request is fulfilled by the Chainlink nodes.
- `ERC721PsiRandomSeedReveal`: The randomness is requested when the `_reveal()` function is called. This function is usually called by the project owner to reveal the tokens. Everytime `_reveal()` is called, it will reveal the random seeds of all the tokens minted since the last reveal.

## Considerations
It is important to realize that `balanceOf`, `totalSupply`, `tokenByIndex`, and `tokenOfOwnerByIndex` in ERC721Psi are not designed to be gas efficient since they are mostly used by front end only. By doing so, we are able to reduce the storage usage and thus minimize the gas consumption for the rest of the functions.

If tracking `balanceOf` on-chain is important for your application, please use the `ERC721PsiAddressData` extension.

## Road Map
- Implement more extensions.
- Add more test cases.
- Build an contract wizard (like [this](https://wizard.openzeppelin.com/#erc721)) for generating the contract skelton. 

## Contributors
PRs on documentations, test cases, and any contract improvemetns are welcomed!!
- [madeinfree](https://github.com/madeinfree)
- [lucaventura](https://github.com/lucaventura)
## Projects using ERC721Psi
If your projects use ERC721Psi, we'd like know more about it!
Feel free to DM [0xEstarriol](https://twitter.com/0xEstarriol) to share your project.
- Medieval Adventurer: [twitter](https://twitter.com/DaoMedieval), [opensea](https://opensea.io/collection/medieval-adventurer/)
- Haruna Future: [twitter](https://twitter.com/HarunaNft), [opensea](https://opensea.io/collection/harunafutureofficial)
