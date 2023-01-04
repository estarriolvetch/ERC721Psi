const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('../helpers.js');
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721psiBurnable = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721psiBurnable.startTokenId
          ? (await this.erc721psiBurnable.startTokenId()).toNumber()
          : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
      });

      beforeEach(async function () {
        const [owner, addr1, addr2, spender] = await ethers.getSigners();
        this.owner = owner;
        this.addr1 = addr1;
        this.addr2 = addr2;
        this.spender = spender;
        this.numTestTokens = 10;
        this.burnedTokenId = 5;
        this.notBurnedTokenId = 6;
        await this.erc721psiBurnable['safeMint(address,uint256)'](this.addr1.address, this.numTestTokens);
        await this.erc721psiBurnable.connect(this.addr1)['burn(uint256)'](this.burnedTokenId);
      });

      context('totalSupply()', function () {
        it('has the expected value', async function () {
          expect(await this.erc721psiBurnable.totalSupply()).to.equal(9);
        });

        it('is reduced by burns', async function () {
          const supplyBefore = await this.erc721psiBurnable.totalSupply();

          for (let i = 0; i < offsetted(2); ++i) {
            await this.erc721psiBurnable.connect(this.addr1)['burn(uint256)'](offsetted(i));
            const supplyNow = await this.erc721psiBurnable.totalSupply();
            expect(supplyNow).to.equal(supplyBefore - (i + 1));
          }
        });
      });
  
      /** @TODO Implement this method?
      it('changes numberBurned', async function () {
        expect(await this.erc721psiBurnable.numberBurned(this.addr1.address)).to.equal(1);
        await this.erc721psiBurnable.connect(this.addr1)['burn(uint256)'](offsetted(0));
        expect(await this.erc721psiBurnable.numberBurned(this.addr1.address)).to.equal(2);
      });
      */

      it('changes totalBurned', async function () {
        const totalBurnedBefore = (await this.erc721psiBurnable.totalBurned()).toNumber();
        expect(totalBurnedBefore).to.equal(1);

        for (let i = 0; i < offsetted(2); ++i) {
          await this.erc721psiBurnable.connect(this.addr1)['burn(uint256)'](offsetted(i));

          const totalBurnedNow = (await this.erc721psiBurnable.totalBurned()).toNumber();
          expect(totalBurnedNow).to.equal(totalBurnedBefore + (i + 1));
        }
      });

      it('changes exists', async function () {
        expect(await this.erc721psiBurnable.exists(this.burnedTokenId)).to.be.false;
        expect(await this.erc721psiBurnable.exists(this.notBurnedTokenId)).to.be.true;
      });

      it('cannot burn a non-existing token', async function () {
        const query = this.erc721psiBurnable.connect(this.addr1)['burn(uint256)'](offsetted(this.numTestTokens));
        await expect(query).to.be.revertedWith('OwnerQueryForNonexistentToken');
      });

      it('cannot burn a burned token', async function () {
        const query = this.erc721psiBurnable.connect(this.addr1)['burn(uint256)'](this.burnedTokenId);
        await expect(query).to.be.revertedWith('OwnerQueryForNonexistentToken');
      });

      it('cannot burn with wrong caller or spender', async function () {
        const tokenIdToBurn = this.notBurnedTokenId;

        // sanity check
        await this.erc721psiBurnable.connect(this.addr1).approve(ZERO_ADDRESS, tokenIdToBurn);
        await this.erc721psiBurnable.connect(this.addr1).setApprovalForAll(this.spender.address, false);

        const query = this.erc721psiBurnable.connect(this.spender)['burn(uint256)'](tokenIdToBurn);
        await expect(query).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
      });

      it('spender can burn with specific approved tokenId', async function () {
        const tokenIdToBurn = this.notBurnedTokenId;

        await this.erc721psiBurnable.connect(this.addr1).approve(this.spender.address, tokenIdToBurn);
        await this.erc721psiBurnable.connect(this.spender)['burn(uint256)'](tokenIdToBurn);
        expect(await this.erc721psiBurnable.exists(tokenIdToBurn)).to.be.false;
      });

      it('spender can burn with one-time approval', async function () {
        const tokenIdToBurn = this.notBurnedTokenId;

        await this.erc721psiBurnable.connect(this.addr1).setApprovalForAll(this.spender.address, true);
        await this.erc721psiBurnable.connect(this.spender)['burn(uint256)'](tokenIdToBurn);
        expect(await this.erc721psiBurnable.exists(tokenIdToBurn)).to.be.false;
      });

      it('cannot transfer a burned token', async function () {
        const query = this.erc721psiBurnable
          .connect(this.addr1)
          .transferFrom(this.addr1.address, this.addr2.address, this.burnedTokenId);
        await expect(query).to.be.revertedWithCustomError(this.erc721psiBurnable, 'OwnerQueryForNonexistentToken');
      });

      it('does not affect _totalMinted', async function () {
        const totalMintedBefore = await this.erc721psiBurnable.totalMinted();
        expect(totalMintedBefore).to.equal(this.numTestTokens);
        for (let i = 0; i < 2; ++i) {
          await this.erc721psiBurnable.connect(this.addr1)['burn(uint256)'](offsetted(i));
        }
        expect(await this.erc721psiBurnable.totalMinted()).to.equal(totalMintedBefore);
      });

      it('adjusts owners balances', async function () {
        expect(await this.erc721psiBurnable.balanceOf(this.addr1.address)).to.be.equal(this.numTestTokens - 1);
      });

      describe('ownerships correctly set', async function () {
        it('with token before previously burnt token transferred and burned', async function () {
          const tokenIdToBurn = this.burnedTokenId - 1;
          await this.erc721psiBurnable
            .connect(this.addr1)
            .transferFrom(this.addr1.address, this.addr2.address, tokenIdToBurn);
          expect(await this.erc721psiBurnable.ownerOf(tokenIdToBurn)).to.be.equal(this.addr2.address);
          await this.erc721psiBurnable.connect(this.addr2)['burn(uint256)'](tokenIdToBurn);
          for (let i = offsetted(0); i < offsetted(this.numTestTokens); ++i) {
            if (i == tokenIdToBurn || i == this.burnedTokenId) {
              expect(await this.erc721psiBurnable.ownerOf(i)).to.be.equal(ZERO_ADDRESS);
            } else {
              expect(await this.erc721psiBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with token after previously burnt token transferred and burned', async function () {
          const tokenIdToBurn = this.burnedTokenId + 1;
          await this.erc721psiBurnable
            .connect(this.addr1)
            .transferFrom(this.addr1.address, this.addr2.address, tokenIdToBurn);
          expect(await this.erc721psiBurnable.ownerOf(tokenIdToBurn)).to.be.equal(this.addr2.address);
          await this.erc721psiBurnable.connect(this.addr2)['burn(uint256)'](tokenIdToBurn);
          for (let i = offsetted(0); i < offsetted(this.numTestTokens); ++i) {
            if (i == tokenIdToBurn || i == this.burnedTokenId) {
              expect(await this.erc721psiBurnable.ownerOf(i)).to.be.equal(ZERO_ADDRESS);
            } else {
              expect(await this.erc721psiBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with first token burned', async function () {
          await this.erc721psiBurnable.connect(this.addr1)['burn(uint256)'](offsetted(0));
          for (let i = offsetted(0); i < offsetted(this.numTestTokens); ++i) {
            if (i == offsetted(0).toNumber() || i == this.burnedTokenId) {
              expect(await this.erc721psiBurnable.ownerOf(i)).to.be.equal(ZERO_ADDRESS);
            } else {
              expect(await this.erc721psiBurnable.ownerOf(i)).to.be.equal(this.addr1.address);
            }
          }
        });

        it('with last token burned', async function () {
          await expect(this.erc721psiBurnable.ownerOf(offsetted(this.numTestTokens))).to.be.revertedWithCustomError(
            this.erc721psiBurnable,
            'OwnerQueryForNonexistentToken'
          );
          await this.erc721psiBurnable.connect(this.addr1)['burn(uint256)'](offsetted(this.numTestTokens - 1));
          expect(await this.erc721psiBurnable.ownerOf(offsetted(this.numTestTokens - 1))).to.be.equal(ZERO_ADDRESS);
        });
      });
    });
  };

describe('ERC721PsiBurnable', createTestSuite({ 
  contract: 'ERC721PsiBurnableMock',
  constructorArgs: ['ERC721Psi', 'ERC721Psi']
}));

describe('ERC721PsiBurnable override _startTokenId()', createTestSuite({ 
  contract: 'ERC721PsiBurnableStartTokenIdMock',
  constructorArgs: ['ERC721Psi', 'ERC721Psi', 1]
}));

describe('ERC721PsiBurnableUpgradeable', createTestSuite({ 
  contract: 'ERC721PsiBurnableMockUpgradeable',
  constructorArgs: ['ERC721Psi', 'ERC721Psi']
}));

describe('ERC721PsiBurnableUpgradeable override _startTokenId()', createTestSuite({ 
  contract: 'ERC721PsiBurnableStartTokenIdMockUpgradeable',
  constructorArgs: ['ERC721Psi', 'ERC721Psi', 1]
}));
