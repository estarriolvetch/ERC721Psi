const { expect } = require('chai');
const ether = require('@openzeppelin/test-helpers/src/ether');

const createTestSuite = ({ contract, constructorArgs}) =>
  function () {
    context(`${contract}`, function () {
      beforeEach(async function () {

        this.vrfCoordinator = await ethers.getContractFactory('VRFCoordinatorV2Mock');
        this.vrfCoordinator = await this.vrfCoordinator.deploy(0,0);
        await this.vrfCoordinator.deployed();

        let txCreateSubscription = await this.vrfCoordinator["createSubscription()"]();
        txCreateSubscription = await txCreateSubscription.wait();
        if (contract.includes("Upgradeable")) {
          this.ERC721PsiImplementation = await ethers.getContractFactory(contract);
          this.ERC721Psi = await upgrades.deployProxy(
            this.ERC721PsiImplementation,
            constructorArgs, 
            {
              unsafeAllow: ["constructor", "state-variable-immutable"],
              constructorArgs: [
                this.vrfCoordinator.address,
                txCreateSubscription.events[0].args.subId
              ]
            }
          );
        }
        else {
          this.ERC721Psi = await ethers.getContractFactory(contract);
          this.ERC721Psi = await this.ERC721Psi.deploy(
            ...constructorArgs,
            this.vrfCoordinator.address,
            txCreateSubscription.events[0].args.subId
          );
        }
        await this.ERC721Psi.deployed();
        txAddConsumer = await this.vrfCoordinator['addConsumer(uint64,address)'](txCreateSubscription.events[0].args.subId, this.ERC721Psi.address);
        await txAddConsumer.wait();
      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2, addr3] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
          this.addr3 = addr3;
          this.txMint1 = await this.ERC721Psi['safeMint(address,uint256)'](addr1.address, 1);
          this.txMint2 = await this.ERC721Psi['safeMint(address,uint256)'](addr2.address, 2);
          this.txMint3 = await this.ERC721Psi['safeMint(address,uint256)'](addr3.address, 3);
          this.txMint1 = await this.txMint1.wait();
          this.txMint2 = await this.txMint2.wait();
          this.txMint3 = await this.txMint3.wait();
        });
        
        describe('seed', async function () {
          it('invalid seed before the randomness has been fulfilled', async function () {
            for (var i = 0; i < 6; i++) {
              await expect(this.ERC721Psi.seed(`${i}`)).to.be.revertedWithCustomError(
                this.ERC721Psi,
                "RandomnessHasntBeenFulfilled"
              );
            }
          });

          it('seed query for nonexistent token', async function () {
            await expect(this.ERC721Psi.seed('6')).to.be.revertedWithCustomError(
              this.ERC721Psi,
              "SeedQueryForNonExistentToken"
            )
          });
  
          if (contract.includes("Reveal")) {
            context('Reveal the seed', function () {
              beforeEach(async function () {
                let txReveal = await this.ERC721Psi["reveal()"]();
                txReveal = await txReveal.wait();

                await this.vrfCoordinator["fulfillRandomWords(uint256,address)"](
                  txReveal.events[1].args.requestId,
                  this.ERC721Psi.address
                );

                // tokenId = 6
                await this.ERC721Psi['safeMint(address,uint256)'](this.addr1.address, 1);
              });

              it('non-zero seed after the randomness has been fulfilled', async function () {
                expect(await this.ERC721Psi.seed('0')).to.not.equal("0");
                expect(await this.ERC721Psi.seed('1')).to.not.equal("0");
                expect(await this.ERC721Psi.seed('2')).to.not.equal("0");
                expect(await this.ERC721Psi.seed('3')).to.not.equal("0");
                expect(await this.ERC721Psi.seed('4')).to.not.equal("0");
                expect(await this.ERC721Psi.seed('5')).to.not.equal("0");
              });

              it('invalid seed before the randomness has been fulfilled', async function () {
                // tokenId = 6 belongs to the next generation whcih its randomness hasn't bee fullfilled.
                await expect(this.ERC721Psi.seed('6')).to.be.revertedWithCustomError(
                  this.ERC721Psi,
                  "RandomnessHasntBeenFulfilled"
                )
              });

              it('seed query for nonexistent token', async function () {
                await expect(this.ERC721Psi.seed('7')).to.be.revertedWithCustomError(
                  this.ERC721Psi,
                  "SeedQueryForNonExistentToken"
                );
              });
            });
          }
          else {
            context('Reveal the seed', function () {
              beforeEach(async function () {

                await this.vrfCoordinator["fulfillRandomWords(uint256,address)"](
                  this.txMint2.events[1].args.requestId,
                  this.ERC721Psi.address
                ); // Corrosponding tokens in the batch: 1 and 2

              });

              it('non-zero seed after the randomness has been fulfilled', async function () {
                await expect(this.ERC721Psi.seed('0')).to.be.revertedWithCustomError(
                  this.ERC721Psi,
                  "RandomnessHasntBeenFulfilled"
                )
                expect(await this.ERC721Psi.seed('1')).to.not.equal("0");
                expect(await this.ERC721Psi.seed('2')).to.not.equal("0");
                await expect(this.ERC721Psi.seed('3')).to.be.revertedWithCustomError(
                  this.ERC721Psi,
                  "RandomnessHasntBeenFulfilled"
                );
              });

              it('seed query for nonexistent token', async function () {
                await expect(this.ERC721Psi.seed('6')).to.be.revertedWithCustomError(
                  this.ERC721Psi,
                  "SeedQueryForNonExistentToken"
                );
              });

            });
          }
        });
      });
    });
  };

describe('ERC721PsiRandomSeed', createTestSuite({
  contract: 'ERC721PsiRandomSeedMock',
  constructorArgs: ['ERC721Psi', 'ERC721Psi'],
}));
describe('ERC721PsiRandomSeedUpgradeable', createTestSuite({
  contract: 'ERC721PsiRandomSeedUpgradeableMock',
  constructorArgs: ['ERC721Psi', 'ERC721Psi'],
}));
describe('ERC721PsiRandomSeedReveal', createTestSuite({
  contract: 'ERC721PsiRandomSeedRevealMock',
  constructorArgs: ['ERC721Psi', 'ERC721Psi'],
}));
describe('ERC721PsiRandomSeedRevealUpgradeable', createTestSuite({
  contract: 'ERC721PsiRandomSeedRevealUpgradeableMock',
  constructorArgs: ['ERC721Psi', 'ERC721Psi'],
}));
