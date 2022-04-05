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

  for(let i = 0; i < 10; i++){
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
    
    await ERC721Psi['safeMint(address,uint256)'](deployer.address, 30);
    await ERC721A['safeMint(address,uint256)'](deployer.address, 30);
    await ERC721Enumerable['safeMintBatch(address,uint256)'](deployer.address, 30);

    console.log(i);
    let erc721Psi_transfer = await ERC721Psi['transferFrom(address,address,uint256)'](deployer.address, user1.address, i);
    console.log("ERC721Psi Transfer (1st time)", (await erc721Psi_transfer.wait()).gasUsed.toString());
    let erc721a_transfer = await ERC721A['transferFrom(address,address,uint256)'](deployer.address, user1.address, i);
    console.log("ERC721A Transfer (1st time)", (await erc721a_transfer.wait()).gasUsed.toString());
    let erc721enumerable_transfer = await ERC721Enumerable['transferFrom(address,address,uint256)'](deployer.address, user1.address, i);
    console.log("ERC721Enumerable Transfer (1st time)", (await erc721enumerable_transfer.wait()).gasUsed.toString());
  
    erc721Psi_transfer = await ERC721Psi.connect(user1)['transferFrom(address,address,uint256)'](user1.address, deployer.address, i);
    console.log("ERC721Psi Transfer", (await erc721Psi_transfer.wait()).gasUsed.toString());
    erc721a_transfer = await ERC721A.connect(user1)['transferFrom(address,address,uint256)'](user1.address, deployer.address, i);
    console.log("ERC721A Transfer", (await erc721a_transfer.wait()).gasUsed.toString());
    erc721enumerable_transfer = await ERC721Enumerable.connect(user1)['transferFrom(address,address,uint256)'](user1.address, deployer.address, i);
    console.log("ERC721Enumerable Transfer", (await erc721enumerable_transfer.wait()).gasUsed.toString());
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
