const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('./helpers.js');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const RECEIVER_MAGIC_VALUE = '0x150b7a02';
const GAS_MAGIC_VALUE = 20000;

const createTestSuite = ({ contract, constructorArgs, initializer}) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function (){
        this.erc721psi = await deployContract(contract, constructorArgs);
        this.receiver = await deployContract('ERC721ReceiverMock', [
          RECEIVER_MAGIC_VALUE, 
          this.erc721psi.address
        ]);
        this.startTokenId = this.erc721psi.startTokenId ? (await this.erc721psi.startTokenId()).toNumber() : 0;
        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr)
      });
      describe('EIP-165 support', async function () {
        it('supports ERC165', async function () {
          expect(await this.erc721psi.supportsInterface('0x01ffc9a7')).to.eq(true);
        });

        it('supports IERC721', async function () {
          expect(await this.erc721psi.supportsInterface('0x80ac58cd')).to.eq(true);
        });

        it('supports ERC721Metadata', async function () {
          expect(await this.erc721psi.supportsInterface('0x5b5e139f')).to.eq(true);
        });

        it('does not support ERC721Enumerable', async function () {
          expect(await this.erc721psi.supportsInterface('0x780e9d63')).to.eq(false);
        });

        it('does not support random interface', async function () {
          expect(await this.erc721psi.supportsInterface('0x00000042')).to.eq(false);
        });
      });

      describe('ERC721Metadata support', async function () {
        it('name', async function () {
          expect(await this.erc721psi.name()).to.eq(constructorArgs[0]);
        });

        it('symbol', async function () {
          expect(await this.erc721psi.symbol()).to.eq(constructorArgs[1]);
        });

        describe('baseURI', async function () {
          it('sends an empty URI by default', async function () {
            expect(await this.erc721psi.baseURI()).to.eq('');
          });
        });
      });

      context('with no minted tokens', async function () {
        it('has 0 totalSupply', async function () {
          const supply = await this.erc721psi.totalSupply();
          expect(supply).to.equal(0);
        });

        it('has 0 totalMinted', async function () {
          const totalMinted = await this.erc721psi.totalMinted();
          expect(totalMinted).to.equal(0);
        });

        it('_nextTokenId must be equal to _startTokenId', async function () {
          const nextTokenId = await this.erc721psi.nextTokenId();
          expect(nextTokenId).to.equal(offsetted(0));
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
          this.expectedMintCount = 6;

          this.addr1.expected = {
            mintCount: 1,
            tokens: [offsetted(0)],
          };

          this.addr2.expected = {
            mintCount: 2,
            tokens: offsetted(1, 2),
          };

          this.addr3.expected = {
            mintCount: 3,
            tokens: offsetted(3, 4, 5),
          };

          await this.erc721psi['safeMint(address,uint256)'](addr1.address, this.addr1.expected.mintCount);
          await this.erc721psi['safeMint(address,uint256)'](addr2.address, this.addr2.expected.mintCount);
          await this.erc721psi['safeMint(address,uint256)'](addr3.address, this.addr3.expected.mintCount);
        });

        describe('tokenURI (ERC721Metadata)', async function () {
          describe('tokenURI', async function () {
            it('sends an empty uri by default', async function () {
              expect(await this.erc721psi.tokenURI(offsetted(0))).to.eq('');
            });

            it('reverts when tokenId does not exist', async function () {
              await expect(this.erc721psi.tokenURI(offsetted(this.expectedMintCount))).to.be.revertedWith(
                'URIQueryForNonexistentToken'
              );
            });
          });
        });

        describe('exists', async function () {
          it('verifies valid tokens', async function () {
            for (let tokenId = offsetted(0); tokenId < offsetted(this.expectedMintCount); tokenId++) {
              const exists = await this.erc721psi.exists(tokenId);
              expect(exists).to.be.true;
            }
          });

          it('verifies invalid tokens', async function () {
            expect(await this.erc721psi.exists(offsetted(this.expectedMintCount))).to.be.false;
          });
        });

        describe('balanceOf', async function () {
          it('returns the amount for a given address', async function () {
            expect(await this.erc721psi.balanceOf(this.owner.address)).to.equal('0');
            expect(await this.erc721psi.balanceOf(this.addr1.address)).to.equal(this.addr1.expected.mintCount);
            expect(await this.erc721psi.balanceOf(this.addr2.address)).to.equal(this.addr2.expected.mintCount);
            expect(await this.erc721psi.balanceOf(this.addr3.address)).to.equal(this.addr3.expected.mintCount);
          });

          it('returns correct amount with transferred tokens', async function () {
            const tokenIdToTransfer = this.addr2.expected.tokens[0];
            await this.erc721psi
              .connect(this.addr2)
              .transferFrom(this.addr2.address, this.addr3.address, tokenIdToTransfer);
            // sanity check
            expect(await this.erc721psi.ownerOf(tokenIdToTransfer)).to.equal(this.addr3.address);

            expect(await this.erc721psi.balanceOf(this.addr2.address)).to.equal(this.addr2.expected.mintCount - 1);
            expect(await this.erc721psi.balanceOf(this.addr3.address)).to.equal(this.addr3.expected.mintCount + 1);
          });

          it('throws an exception for the 0 address', async function () {
            await expect(this.erc721psi.balanceOf(ZERO_ADDRESS)).to.be.revertedWith('BalanceQueryForZeroAddress');
          });
        });

        describe('_numberMinted', async function () {
          it('returns the amount for a given address', async function () {
            expect(await this.erc721psi.numberMinted(this.owner.address)).to.equal('0');
            expect(await this.erc721psi.numberMinted(this.addr1.address)).to.equal(this.addr1.expected.mintCount);
            expect(await this.erc721psi.numberMinted(this.addr2.address)).to.equal(this.addr2.expected.mintCount);
            expect(await this.erc721psi.numberMinted(this.addr3.address)).to.equal(this.addr3.expected.mintCount);
          });

          it('returns the same amount with transferred token', async function () {
            const tokenIdToTransfer = this.addr2.expected.tokens[0];
            await this.erc721psi
              .connect(this.addr2)
              .transferFrom(this.addr2.address, this.addr3.address, tokenIdToTransfer);
            // sanity check
            expect(await this.erc721psi.ownerOf(tokenIdToTransfer)).to.equal(this.addr3.address);
            //numberMinted method on the mock currently just return balanceOf
            expect(await this.erc721psi.numberMinted(this.addr2.address)).to.equal(this.addr2.expected.mintCount - 1);
            expect(await this.erc721psi.numberMinted(this.addr3.address)).to.equal(this.addr3.expected.mintCount + 1);
          });
        });

        context('_totalMinted', async function () {
          it('has correct totalMinted', async function () {
            const totalMinted = await this.erc721psi.totalMinted();
            expect(totalMinted).to.equal(this.expectedMintCount);
          });
        });

        context('_nextTokenId', async function () {
          it('has correct nextTokenId', async function () {
            const nextTokenId = await this.erc721psi.nextTokenId();
            expect(nextTokenId).to.equal(offsetted(this.expectedMintCount));
          });
        });

        describe('ownerOf', async function () {
          it('returns the right owner', async function () {
            for (const minter of [this.addr1, this.addr2, this.addr3]) {
              for (const tokenId of minter.expected.tokens) {
                expect(await this.erc721psi.ownerOf(tokenId)).to.equal(minter.address);
              }
            }
          });

          it('reverts for an invalid token', async function () {
            await expect(this.erc721psi.ownerOf(10)).to.be.revertedWith('OwnerQueryForNonexistentToken');
          });
        });

        describe('approve', async function () {
          beforeEach(function () {
            this.tokenId = this.addr1.expected.tokens[0];
            this.tokenId2 = this.addr2.expected.tokens[0];
          });

          it('sets approval for the target address', async function () {
            await this.erc721psi.connect(this.addr1).approve(this.addr2.address, this.tokenId);
            const approval = await this.erc721psi.getApproved(this.tokenId);
            expect(approval).to.equal(this.addr2.address);
          });

          it('set approval for the target address on behalf of the owner', async function () {
            await this.erc721psi.connect(this.addr1).setApprovalForAll(this.addr2.address, true);
            await this.erc721psi.connect(this.addr2).approve(this.addr3.address, this.tokenId);
            const approval = await this.erc721psi.getApproved(this.tokenId);
            expect(approval).to.equal(this.addr3.address);
          });

          it('rejects an unapproved caller', async function () {
            await expect(this.erc721psi.approve(this.addr2.address, this.tokenId)).to.be.revertedWith(
              'ApprovalCallerNotOwnerNorApproved'
            );
          });

          it('does not get approved for invalid tokens', async function () {
            await expect(this.erc721psi.getApproved(10)).to.be.revertedWith('ApprovalQueryForNonexistentToken');
          });

          it('approval allows token transfer', async function () {
            await expect(
              this.erc721psi.connect(this.addr3).transferFrom(this.addr1.address, this.addr3.address, this.tokenId)
            ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
            await this.erc721psi.connect(this.addr1).approve(this.addr3.address, this.tokenId);
            await this.erc721psi.connect(this.addr3).transferFrom(this.addr1.address, this.addr3.address, this.tokenId);
            await expect(
              this.erc721psi.connect(this.addr1).transferFrom(this.addr3.address, this.addr1.address, this.tokenId)
            ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
          });

          it('token owner can approve self as operator', async function () {
            expect(await this.erc721psi.getApproved(this.tokenId)).to.not.equal(this.addr1.address);
            await expect(this.erc721psi.connect(this.addr1).approve(this.addr1.address, this.tokenId)
            ).to.not.be.reverted;
            expect(await this.erc721psi.getApproved(this.tokenId)).to.equal(this.addr1.address);
          });

          it('self-approval is cleared on token transfer', async function () {
            await this.erc721psi.connect(this.addr1).approve(this.addr1.address, this.tokenId); 
            expect(await this.erc721psi.getApproved(this.tokenId)).to.equal(this.addr1.address);

            await this.erc721psi.connect(this.addr1).transferFrom(this.addr1.address, this.addr2.address, this.tokenId);
            expect(await this.erc721psi.getApproved(this.tokenId)).to.not.equal(this.addr1.address);
          });

          it('direct approve works', async function () {
            expect(await this.erc721psi.getApproved(this.tokenId)).to.not.equal(this.addr1.address);
            await this.erc721psi.connect(this.addr2).directApprove(this.addr1.address, this.tokenId); 
            expect(await this.erc721psi.getApproved(this.tokenId)).to.equal(this.addr1.address);
          });
        });

        describe('setApprovalForAll', async function () {
          it('sets approval for all properly', async function () {
            const approvalTx = await this.erc721psi.setApprovalForAll(this.addr1.address, true);
            await expect(approvalTx)
              .to.emit(this.erc721psi, 'ApprovalForAll')
              .withArgs(this.owner.address, this.addr1.address, true);
            expect(await this.erc721psi.isApprovedForAll(this.owner.address, this.addr1.address)).to.be.true;
          });

          it('caller can approve all with self as operator', async function () {
            expect(
              await this.erc721psi.connect(this.addr1).isApprovedForAll(this.addr1.address, this.addr1.address)
            ).to.be.false;
            await expect(
              this.erc721psi.connect(this.addr1).setApprovalForAll(this.addr1.address, true)
            ).to.not.be.reverted;
            expect(
              await this.erc721psi.connect(this.addr1).isApprovedForAll(this.addr1.address, this.addr1.address)
            ).to.be.true;
          });
        });

        context('test transfer functionality', function () {
          const testSuccessfulTransfer = function (transferFn, transferToContract = true) {
            beforeEach(async function () {
              const sender = this.addr2;
              this.tokenId = this.addr2.expected.tokens[0];
              this.from = sender.address;
              this.to = transferToContract ? this.receiver : this.addr4;
              await this.erc721psi.connect(sender).approve(this.to.address, this.tokenId);
              // prettier-ignore
              this.transferTx = await this.erc721psi
                .connect(sender)[transferFn](this.from, this.to.address, this.tokenId);
            });

            it('transfers the ownership of the given token ID to the given address', async function () {
              expect(await this.erc721psi.ownerOf(this.tokenId)).to.be.equal(this.to.address);
            });

            it('emits a Transfer event', async function () {
              await expect(this.transferTx)
                .to.emit(this.erc721psi, 'Transfer')
                .withArgs(this.from, this.to.address, this.tokenId);
            });

            it('clears the approval for the token ID', async function () {
              expect(await this.erc721psi.getApproved(this.tokenId)).to.be.equal(ZERO_ADDRESS);
            });

            it('adjusts owners balances', async function () {
              expect(await this.erc721psi.balanceOf(this.from)).to.be.equal(1);
            });
          };

          const testUnsuccessfulTransfer = function (transferFn) {
            beforeEach(function () {
              this.tokenId = this.addr2.expected.tokens[0];
              this.sender = this.addr1;
            });

            it('rejects unapproved transfer', async function () {
              await expect(
                this.erc721psi.connect(this.sender)[transferFn](this.addr2.address, this.sender.address, this.tokenId)
              ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
            });

            it('rejects transfer from incorrect owner', async function () {
              await this.erc721psi.connect(this.addr2).setApprovalForAll(this.sender.address, true);
              await expect(
                this.erc721psi.connect(this.sender)[transferFn](this.addr3.address, this.sender.address, this.tokenId)
              ).to.be.revertedWith('TransferFromIncorrectOwner');
            });

            it('rejects transfer to zero address', async function () {
              await this.erc721psi.connect(this.addr2).setApprovalForAll(this.sender.address, true);
              await expect(
                this.erc721psi.connect(this.sender)[transferFn](this.addr2.address, ZERO_ADDRESS, this.tokenId)
              ).to.be.revertedWith('TransferToZeroAddress');
            });
          };

          context('successful transfers', function () {
            context('transferFrom', function () {
              describe('to contract', function () {
                testSuccessfulTransfer('transferFrom');
              });

              describe('to EOA', function () {
                testSuccessfulTransfer('transferFrom', false);
              });
            });

            context('safeTransferFrom', function () {
              describe('to contract', function () {
                testSuccessfulTransfer('safeTransferFrom(address,address,uint256)');

                it('validates ERC721Received', async function () {
                  await expect(this.transferTx)
                    .to.emit(this.receiver, 'Received')
                    .withArgs(this.addr2.address, this.addr2.address, this.tokenId, '0x', GAS_MAGIC_VALUE);
                });
              });

              describe('to EOA', function () {
                testSuccessfulTransfer('safeTransferFrom(address,address,uint256)', false);
              });
            });
          });

          context('unsuccessful transfers', function () {
            describe('transferFrom', function () {
              testUnsuccessfulTransfer('transferFrom');
            });

            describe('safeTransferFrom', function () {
              testUnsuccessfulTransfer('safeTransferFrom(address,address,uint256)');

              it('reverts for non-receivers', async function () {
                const nonReceiver = this.erc721psi;
                // prettier-ignore
                await expect(
                  this.erc721psi.connect(this.addr1)['safeTransferFrom(address,address,uint256)'](
                      this.addr1.address,
                      nonReceiver.address,
                      offsetted(0)
                    )
                ).to.be.revertedWith('TransferToNonERC721ReceiverImplementer');
              });

              it('reverts when the receiver reverted', async function () {
                // prettier-ignore
                await expect(
                  this.erc721psi.connect(this.addr1)['safeTransferFrom(address,address,uint256,bytes)'](
                      this.addr1.address,
                      this.receiver.address,
                      offsetted(0),
                      '0x01'
                    )
                ).to.be.revertedWith('reverted in the receiver contract!');
              });

              it('reverts if the receiver returns the wrong value', async function () {
                // prettier-ignore
                await expect(
                  this.erc721psi.connect(this.addr1)['safeTransferFrom(address,address,uint256,bytes)'](
                      this.addr1.address,
                      this.receiver.address,
                      offsetted(0),
                      '0x02'
                    )
                ).to.be.revertedWith('TransferToNonERC721ReceiverImplementer');
              });
            });
          });
        });

      });

      context('test mint functionality', function () {
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
        });

        const testSuccessfulMint = function (safe, quantity, mintForContract = true) {
          beforeEach(async function () {
            this.minter = mintForContract ? this.receiver : this.addr1;

            const mintFn = safe ? 'safeMint(address,uint256)' : 'mint(address,uint256)';

            this.balanceBefore = (await this.erc721psi.balanceOf(this.minter.address)).toNumber();

            this.timestampToMine = (await getBlockTimestamp()) + 12345;
            await mineBlockTimestamp(this.timestampToMine);
            this.timestampMined = await getBlockTimestamp();

            this.mintTx = await this.erc721psi[mintFn](this.minter.address, quantity);
          });

          it('changes ownership', async function () {
            for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
              expect(await this.erc721psi.ownerOf(tokenId)).to.equal(this.minter.address);
            }
          });

          it('emits a Transfer event', async function () {
            for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
              await expect(this.mintTx)
                .to.emit(this.erc721psi, 'Transfer')
                .withArgs(ZERO_ADDRESS, this.minter.address, tokenId);
            }
          });

          it('adjusts owners balances', async function () {
            expect(await this.erc721psi.balanceOf(this.minter.address)).to.be.equal(this.balanceBefore + quantity);
          });

          if (safe && mintForContract) {
            it('validates ERC721Received', async function () {
              for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
                await expect(this.mintTx)
                  .to.emit(this.minter, 'Received')
                  .withArgs(this.owner.address, ZERO_ADDRESS, tokenId, '0x', GAS_MAGIC_VALUE);
              }
            });
          }
        };

        const testUnsuccessfulMint = function (safe) {
          beforeEach(async function () {
            this.mintFn = safe ? 'safeMint(address,uint256)' : 'mint(address,uint256)';
          });

          it('rejects mints to the zero address', async function () {
            await expect(this.erc721psi[this.mintFn](ZERO_ADDRESS, 1)).to.be.revertedWith('MintToZeroAddress');
          });

          it('requires quantity to be greater than 0', async function () {
            await expect(this.erc721psi[this.mintFn](this.owner.address, 0)).to.be.revertedWith('MintZeroQuantity');
          });
        };

        context('successful mints', function () {
          context('mint', function () {
            context('for contract', function () {
              describe('single token', function () {
                testSuccessfulMint(false, 1);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(false, 5);
              });

              it('does not revert for non-receivers', async function () {
                const nonReceiver = this.erc721psi;
                await this.erc721psi.mint(nonReceiver.address, 1);
                expect(await this.erc721psi.ownerOf(offsetted(0))).to.equal(nonReceiver.address);
              });
            });

            context('for EOA', function () {
              describe('single token', function () {
                testSuccessfulMint(false, 1, false);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(false, 5, false);
              });
            });
          });

          context('safeMint', function () {
            context('for contract', function () {
              describe('single token', function () {
                testSuccessfulMint(true, 1);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(true, 5);
              });

              it('validates ERC721Received with custom _data', async function () {
                const customData = ethers.utils.formatBytes32String('custom data');
                const tx = await this.erc721psi['safeMint(address,uint256,bytes)'](this.receiver.address, 1, customData);
                await expect(tx)
                  .to.emit(this.receiver, 'Received')
                  .withArgs(this.owner.address, ZERO_ADDRESS, offsetted(0), customData, GAS_MAGIC_VALUE);
              });
            });

            context('for EOA', function () {
              describe('single token', function () {
                testSuccessfulMint(true, 1, false);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(true, 5, false);
              });
            });
          });
        });

        context('unsuccessful mints', function () {
          context('mint', function () {
            testUnsuccessfulMint(false);
          });

          context('safeMint', function () {
            testUnsuccessfulMint(true);

            it('reverts for non-receivers', async function () {
              const nonReceiver = this.erc721psi;
              await expect(this.erc721psi['safeMint(address,uint256)'](nonReceiver.address, 1)).to.be.revertedWith(
                'TransferToNonERC721ReceiverImplementer'
              );
            });

            it('reverts when the receiver reverted', async function () {
              await expect(
                this.erc721psi['safeMint(address,uint256,bytes)'](this.receiver.address, 1, '0x01')
              ).to.be.revertedWith('reverted in the receiver contract!');
            });

            it('reverts if the receiver returns the wrong value', async function () {
              await expect(
                this.erc721psi['safeMint(address,uint256,bytes)'](this.receiver.address, 1, '0x02')
              ).to.be.revertedWith('TransferToNonERC721ReceiverImplementer');
            });

            it('reverts with reentrant call', async function () {
              await expect(
                this.erc721psi['safeMint(address,uint256,bytes)'](this.receiver.address, 1, '0x03')
              ).to.be.reverted;
            });
          });
        });
      });
    });
  };

describe('ERC721Psi', createTestSuite({ 
  contract: 'ERC721PsiMock', 
  constructorArgs: ['ERC721Psi', 'ERC721Psi'],
}));

describe('ERC721Psi override _startTokenId()', createTestSuite({ 
  contract: 'ERC721PsiStartTokenIdMock', 
  constructorArgs: ['ERC721Psi', 'ERC721Psi', 1],
}));

describe('ERC721PsiUpgradeable', createTestSuite({
  contract: 'ERC721PsiMockUpgradeable',
  constructorArgs: ['ERC721Psi', 'ERC721Psi'],
}));

describe('ERC721PsiUpgradeable override _startTokenId()', createTestSuite({
  contract: 'ERC721PsiStartTokenIdMockUpgradeable',
  constructorArgs: ['ERC721Psi', 'ERC721Psi', 1],
}));
