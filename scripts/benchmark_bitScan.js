// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { BigNumber } = require("ethers");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  const user1 = accounts[1];

  const BitScan = await ethers.getContractFactory("BitScanMock");
  let bitscan = await BitScan.deploy();
  await bitscan.deployed();

  const ONE = BigNumber.from("1");

  for(let i = 0; i < 255; i++){
    console.log(i);
    await bitscan.benchmarkBitScanForward256(ONE.shl(i));
    await bitscan.benchmarkBitScanForward256Iterate(ONE.shl(i));
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
