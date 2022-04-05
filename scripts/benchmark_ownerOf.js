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

  let ERC721Psi = await hre.ethers.getContractFactory("ERC721PsiMock");
  ERC721Psi = await ERC721Psi.deploy("ERC721Psi", "ERC721Psi");
  ERC721Psi = await ERC721Psi.deployed();

  console.log("ERC721Psi deployed to:", ERC721Psi.address);

  let ERC721A = await hre.ethers.getContractFactory("ERC721AMock");
  ERC721A = await ERC721A.deploy("ERC721A", "ERC721A");
  ERC721A = await ERC721A.deployed();

  console.log("ERC721A deployed to:", ERC721A.address);

  let ERC721Enumerable = await hre.ethers.getContractFactory("ERC721EnumerableMock");
  ERC721Enumerable = await ERC721Enumerable.deploy("ERC721Enumerable", "ERC721Enumerable");
  ERC721Enumerable = await ERC721Enumerable.deployed();

  console.log("ERC721Enumerable deployed to:", ERC721Enumerable.address);


  let erc721Psi_mint = await ERC721Psi['safeMint(address,uint256)'](deployer.address, 1024);
  console.log("ERC721Psi Mint", (await erc721Psi_mint.wait()).gasUsed.toString());
  let erc721a_mint = await ERC721A['safeMint(address,uint256)'](deployer.address, 1024);
  console.log("ERC721A Mint", (await erc721a_mint.wait()).gasUsed.toString());

  for(let i = 0; i< 1024; i++){
    await ERC721Enumerable['safeMint(address,uint256)'](deployer.address, i);
  }

  for(let i = 16; i>=0; i-=1){
    console.log(i)
    await ERC721Psi['benchmarkOwnerOf(uint256)'](i);  
    await ERC721A['benchmarkOwnerOf(uint256)'](i);
    await ERC721Enumerable['benchmarkOwnerOf(uint256)'](i);
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
