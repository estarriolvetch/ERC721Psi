// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  const user1 = accounts[1];

  for(let i = 1; i < 11; i++){
    let ERC721Psi = await hre.ethers.getContractFactory("ERC721PsiBurnableMock");
    ERC721Psi = await ERC721Psi.deploy("ERC721Psi", "ERC721Psi");
    ERC721Psi = await ERC721Psi.deployed();
    
    //console.log("ERC721Psi deployed to:", ERC721Psi.address);

    let ERC721A = await hre.ethers.getContractFactory("ERC721AMock");
    ERC721A = await ERC721A.deploy("ERC721A", "ERC721A");

    ERC721A = await ERC721A.deployed();

    //console.log("ERC721A deployed to:", ERC721A.address);

    let ERC721Enumerable = await hre.ethers.getContractFactory("ERC721EnumerableMock");
    ERC721Enumerable = await ERC721Enumerable.deploy("ERC721Enumerable", "ERC721Enumerable");
    ERC721Enumerable = await ERC721Enumerable.deployed();
    
    await ERC721Psi['safeMint(address,uint256)'](deployer.address, 30);
    await ERC721A['safeMint(address,uint256)'](deployer.address, 30);
    await ERC721Enumerable['safeMintBatch(address,uint256)'](deployer.address, 30);

    // Burn one token to initialize some internal states, so the benchmark fits the real world scneraio better.
    await ERC721Psi['burn(uint256,uint256)'](0, 1);
    await ERC721A['burn(uint256,uint256)'](0, 1);
    await ERC721Enumerable['burn(uint256,uint256)'](0, 1);

    console.log(i);
    let erc721Psi_burn = await ERC721Psi['burn(uint256,uint256)'](1, i);
    console.log("ERC721Psi burn", (await erc721Psi_burn.wait()).gasUsed.toString());
    let erc721a_burn = await ERC721A['burn(uint256,uint256)'](1, i);
    console.log("ERC721A burn", (await erc721a_burn.wait()).gasUsed.toString());
    let erc721enumerable_burn = await ERC721Enumerable['burn(uint256,uint256)'](1, i);
    console.log("ERC721Enumerable burn", (await erc721enumerable_burn.wait()).gasUsed.toString());
  
   
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
