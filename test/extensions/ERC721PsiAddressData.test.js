const { deployContract, offsettedIndex, bigNumbersToNumbers } = require('../helpers.js');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721PsiAddressData = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc721PsiAddressData.startTokenId
          ? (await this.erc721PsiAddressData.startTokenId()).toNumber()
          : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
      });

      function expectOwnedBy(owner, address) {
        expect(owner).to.eql(address);
      }

      function expectBnsToEqBns(bns1, bns2) {
        expect(bigNumbersToNumbers(bns1)).to.eql(bigNumbersToNumbers(bns2));
      }

      context('with no minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
        });

        describe('tokensOfOwner', async function () {
          it('returns empty array', async function () {
            expect(await this.erc721PsiAddressData.tokensOfOwner(this.owner.address)).to.eql([]);
            expect(await this.erc721PsiAddressData.tokensOfOwner(this.addr1.address)).to.eql([]);
          });
        });

        describe('ownerOf', async function () {
          it('returns empty struct', async function () {
            await expect(this.erc721PsiAddressData.ownerOf(0)).to.be.revertedWithCustomError(this.erc721PsiAddressData, "OwnerQueryForNonexistentToken");
            await expect(this.erc721PsiAddressData.ownerOf(1)).to.be.revertedWithCustomError(this.erc721PsiAddressData, "OwnerQueryForNonexistentToken");
          });
        });

      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
          this.addr3 = addr3;
          this.addr4 = addr4;

          this.addr1.expected = {
            balance: 1,
            tokens: [offsetted(0)],
          };

          this.addr2.expected = {
            balance: 2,
            tokens: offsetted(1, 2),
          };

          this.addr3.expected = {
            balance: 3,
            tokens: offsetted(3, 4, 5),
          };

          this.addr4.expected = {
            balance: 0,
            tokens: [],
          };

          this.owner.expected = {
            balance: 3,
            tokens: offsetted(6, 7, 8),
          };

          this.lastTokenId = offsetted(8);
          this.currentIndex = this.lastTokenId.add(1);

          this.mintOrder = [this.addr1, this.addr2, this.addr3, this.addr4, owner];

          for (const minter of this.mintOrder) {
            const balance = minter.expected.balance;
            if (balance > 0) {
              await this.erc721PsiAddressData['safeMint(address,uint256)'](minter.address, balance);
            }
            // sanity check
            expect(await this.erc721PsiAddressData.balanceOf(minter.address)).to.equal(minter.expected.balance);
            expect(await this.erc721PsiAddressData.numberMinted(minter.address)).to.equals(minter.expected.balance);
          }
        });

        describe('tokensOfOwner', async function () {
          it('initial', async function () {
            for (const minter of this.mintOrder) {
              const tokens = await this.erc721PsiAddressData.tokensOfOwner(minter.address);
              expectBnsToEqBns(tokens, minter.expected.tokens);
            }
          });

          //change logic with an AddressDataBurnable
          it('after a transfer', async function () {
            // Break sequential order by transfering 7th token from owner to addr4
            const tokenIdToTransfer = [offsetted(7)];
            await this.erc721PsiAddressData.transferFrom(this.owner.address, this.addr4.address, tokenIdToTransfer[0]);

            // Load balances
            const ownerTokens = await this.erc721PsiAddressData.tokensOfOwner(this.owner.address);
            const addr4Tokens = await this.erc721PsiAddressData.tokensOfOwner(this.addr4.address);

            // Verify the function can still read the correct token ids
            expectBnsToEqBns(ownerTokens, offsetted(6, 8));
            expectBnsToEqBns(addr4Tokens, tokenIdToTransfer);
          });
        });

        describe('ownerOf', async function () {
          it('token exists', async function () {
            const tokenId = this.owner.expected.tokens[0];
            const explicitOwnership = await this.erc721PsiAddressData.ownerOf(tokenId);
            expectOwnedBy(explicitOwnership, this.owner.address);
          });

          it('after a token transfer', async function () {
            const tokenId = this.owner.expected.tokens[0];
            await this.erc721PsiAddressData.transferFrom(this.owner.address, this.addr4.address, tokenId);
            const explicitOwnership = await this.erc721PsiAddressData.ownerOf(tokenId);
            expectOwnedBy(explicitOwnership, this.addr4.address);
          });

          it('out of bounds', async function () {
            await expect(this.erc721PsiAddressData.ownerOf(this.currentIndex)).to.be.revertedWithCustomError(this.erc721PsiAddressData, "OwnerQueryForNonexistentToken");
          });
        });

      });
    });
  };

describe(
  'ERC721PsiAddressData',
  createTestSuite({
    contract: 'ERC721PsiAddressDataMock',
    constructorArgs: ['ERC721Psi', 'ERC721Psi'],
  })
);

describe(
  'ERC721PsiAddressData override _startTokenId()',
  createTestSuite({
    contract: 'ERC721PsiAddressDataStartTokenIdMock',
    constructorArgs: ['ERC721Psi', 'ERC721Psi', 1],
  })
);
