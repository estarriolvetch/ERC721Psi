# ERC721Psi
[![Node.js CI](https://github.com/estarriolvetch/ERC721Psi/actions/workflows/node.js.yml/badge.svg)](https://github.com/estarriolvetch/ERC721Psi/actions/workflows/node.js.yml)

ERC721Psi is an ERC721 compilant implementation designed for scalable and gas-efficient on-chain application with built-in randomized metadata generation. Inspired by AzukiZen's awesome ERC721A, ERC721Psi also provides batch minting at a fixed gas cost. However, ERC721Psi manages to solve the scaling issue of token transfer through the mathematical power of the [de Bruijn sequence](https://en.wikipedia.org/wiki/De_Bruijn_sequence).

Powered by Chainlink's VRF V2, ERC721Psi comes with an extension that can batch mint multiple tokens with tamper-proof on-chain random attributes while retaining the fixed minting gas cost.

Litepaper: https://medium.com/@medievaldao/erc721psi-a-truly-scalable-nft-standard-for-low-gas-on-chain-applications-and-randomized-metadata-c25c9e8ac8a8

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
It is important to realize that `balanceOf`, `totalSupply`, `tokenByIndex`, and `tokenOfOwnerByIndex` in ERC721Psi are not designed to be gas efficient since they are mostly used by front end only. By doing so, we are able to reduce the storage usage and thus minimize the gas consumption for the rest of the function.

If tracking `balanceOf` on-chain is important for your application, please use the ERC721PsiTrackBalance extension (coming soon).

## Road Map
- Implement more extensions.
- Add more test cases.
- Build an contract wizard (like [this](https://wizard.openzeppelin.com/#erc721)) for generating the contract skelton. 

## Contributors
PRs on documentations, test cases, and any contract improvemetns are welcomed!!

## Projects using ERC721Psi
If your projects use ERC721Psi, we'd like know more about it!
Feel free to DM [0xEstarriol](https://twitter.com/0xEstarriol) to share your project.
- [Medieval Adventurer](https://twitter.com/DaoMedieval)
