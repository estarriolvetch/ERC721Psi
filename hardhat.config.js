require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
require('@openzeppelin/hardhat-upgrades');


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat:{
      blockGasLimit: 120_000_000 
      // 4x block limit (120 million). An reasonable amount for major node operators
      // eth_call limit:
      // Alchemy: 550 million
      // Infura: 10x (300 Million)
    }
  },
  solidity: {compilers: [
    {
      version: "0.8.11",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },{
      version: "0.4.16",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }]},
};
