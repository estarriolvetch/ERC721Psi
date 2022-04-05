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

  for(let i = 1; i < 30; i++){
    let ERC721Psi = await hre.ethers.getContractFactory("ERC721PsiMock");
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
    
    // Mint at least one token before to initialize most of the parameters, 
    // so the result fits the real world scenerio better
    await ERC721Psi['safeMint(address,uint256)'](user1.address, 1);
    await ERC721A['safeMint(address,uint256)'](user1.address, 1);
    await ERC721Enumerable['safeMintBatch(address,uint256)'](user1.address, 1);

    console.log(i);
    let erc721Psi_mint = await ERC721Psi['safeMint(address,uint256)'](deployer.address, i);
    console.log("ERC721Psi Mint", (await erc721Psi_mint.wait()).gasUsed.toString());
    let erc721a_mint = await ERC721A['safeMint(address,uint256)'](deployer.address, i);
    console.log("ERC721A Mint", (await erc721a_mint.wait()).gasUsed.toString());
    let erc721enumerable_mint = await ERC721Enumerable['safeMintBatch(address,uint256)'](deployer.address, i);
    console.log("ERC721Enumerable Mint", (await erc721enumerable_mint.wait()).gasUsed.toString());
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
