const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const ether = require('@openzeppelin/test-helpers/src/ether');
const { ZERO_ADDRESS } = constants;

const RECEIVER_MAGIC_VALUE = '0x150b7a02';
const GAS_MAGIC_VALUE = 20000;

describe('ERC721PsiRandomSeed', function () {
  beforeEach(async function () {

    this.vrfCoordinator = await ethers.getContractFactory('VRFCoordinatorV2Mock');
    this.vrfCoordinator = await this.vrfCoordinator.deploy(0,0);
    await this.vrfCoordinator.deployed();

    let txCreateSubscription = await this.vrfCoordinator["createSubscription()"]();
    txCreateSubscription = await txCreateSubscription.wait();
    
    this.ERC721Psi = await ethers.getContractFactory('ERC721PsiRandomSeedMock');
    this.ERC721Receiver = await ethers.getContractFactory('ERC721ReceiverMock');
    this.ERC721Psi = await this.ERC721Psi.deploy('ERC721Psi', 'ERC721Psi',
      this.vrfCoordinator.address,
      txCreateSubscription.events[0].args.subId
    );
    await this.ERC721Psi.deployed();
  });

  context('with no minted tokens', async function () {
    it('has 0 totalSupply', async function () {
      const supply = await this.ERC721Psi.totalSupply();
      expect(supply).to.equal(0);
    });
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
        await expect(this.ERC721Psi.seed('0')).to.be.revertedWith(
          "ERC721PsiRandomSeed: Randomness hasn't been fullfilled"
        );
        await expect(this.ERC721Psi.seed('1')).to.be.revertedWith(
          "ERC721PsiRandomSeed: Randomness hasn't been fullfilled"
        );
        await expect(this.ERC721Psi.seed('2')).to.be.revertedWith(
          "ERC721PsiRandomSeed: Randomness hasn't been fullfilled"
        );
        await expect(this.ERC721Psi.seed('3')).to.be.revertedWith(
          "ERC721PsiRandomSeed: Randomness hasn't been fullfilled"
        );
        await expect(this.ERC721Psi.seed('4')).to.be.revertedWith(
          "ERC721PsiRandomSeed: Randomness hasn't been fullfilled"
        );
        await expect(this.ERC721Psi.seed('5')).to.be.revertedWith(
          "ERC721PsiRandomSeed: Randomness hasn't been fullfilled"
        );
      });

      it('seed query for nonexistent token', async function () {
        await expect(this.ERC721Psi.seed('6')).to.be.revertedWith(
          "ERC721PsiRandomSeed: seed query for nonexistent token"
        )
      });

      context('Reveal the seed', function () {
        beforeEach(async function () {

          await this.vrfCoordinator["fulfillRandomWords(uint256,address)"](
            this.txMint2.events[1].args.requestId,
            this.ERC721Psi.address
          ); // Corrosponding tokens in the batch: 1 and 2

        });

        it('non-zero seed after the randomness has been fulfilled', async function () {
          await expect(this.ERC721Psi.seed('0')).to.be.revertedWith(
            "ERC721PsiRandomSeed: Randomness hasn't been fullfilled"
          )
          expect(await this.ERC721Psi.seed('1')).to.not.equal("0");
          expect(await this.ERC721Psi.seed('2')).to.not.equal("0");

          await expect(this.ERC721Psi.seed('3')).to.be.revertedWith(
            "ERC721PsiRandomSeed: Randomness hasn't been fullfilled"
          );
        });


        it('seed query for nonexistent token', async function () {
          await expect(this.ERC721Psi.seed('6')).to.be.revertedWith(
            "ERC721PsiRandomSeed: seed query for nonexistent token"
          )
        });
      });
    });

    it('has 6 totalSupply', async function () {
      const supply = await this.ERC721Psi.totalSupply();
      expect(supply).to.equal(6);
    });

    describe('exists', async function () {
      it('verifies valid tokens', async function () {
        for (let tokenId = 0; tokenId < 6; tokenId++) {
          const exists = await this.ERC721Psi.exists(tokenId);
          expect(exists).to.be.true;
        }
      });

      it('verifies invalid tokens', async function () {
        const exists = await this.ERC721Psi.exists(6);
        expect(exists).to.be.false;
      });
    });

    describe('balanceOf', async function () {
      it('returns the amount for a given address', async function () {
        expect(await this.ERC721Psi.balanceOf(this.owner.address)).to.equal('0');
        expect(await this.ERC721Psi.balanceOf(this.addr1.address)).to.equal('1');
        expect(await this.ERC721Psi.balanceOf(this.addr2.address)).to.equal('2');
        expect(await this.ERC721Psi.balanceOf(this.addr3.address)).to.equal('3');
      });

      it('throws an exception for the 0 address', async function () {
        await expect(this.ERC721Psi.balanceOf(ZERO_ADDRESS)).to.be.revertedWith(
          'ERC721Psi: balance query for the zero address'
        );
      });
    });

    describe('ownerOf', async function () {
      it('returns the right owner', async function () {
        expect(await this.ERC721Psi.ownerOf(0)).to.equal(this.addr1.address);
        expect(await this.ERC721Psi.ownerOf(1)).to.equal(this.addr2.address);
        expect(await this.ERC721Psi.ownerOf(5)).to.equal(this.addr3.address);
      });

      it('reverts for an invalid token', async function () {
        await expect(this.ERC721Psi.ownerOf(10)).to.be.revertedWith('ERC721Psi: owner query for nonexistent token');
      });
    });

    describe('approve', async function () {
      const tokenId = 0;
      const tokenId2 = 1;

      it('sets approval for the target address', async function () {
        await this.ERC721Psi.connect(this.addr1).approve(this.addr2.address, tokenId);
        const approval = await this.ERC721Psi.getApproved(tokenId);
        expect(approval).to.equal(this.addr2.address);
      });

      it('rejects an invalid token owner', async function () {
        await expect(this.ERC721Psi.connect(this.addr1).approve(this.addr2.address, tokenId2)).to.be.revertedWith(
          'ERC721Psi: approval to current owner'
        );
      });

      it('rejects an unapproved caller', async function () {
        await expect(this.ERC721Psi.approve(this.addr2.address, tokenId)).to.be.revertedWith(
          'ERC721Psi: approve caller is not owner nor approved for all'
        );
      });

      it('does not get approved for invalid tokens', async function () {
        await expect(this.ERC721Psi.getApproved(10)).to.be.revertedWith('ERC721Psi: approved query for nonexistent token');
      });
    });

    describe('setApprovalForAll', async function () {
      it('sets approval for all properly', async function () {
        const approvalTx = await this.ERC721Psi.setApprovalForAll(this.addr1.address, true);
        await expect(approvalTx)
          .to.emit(this.ERC721Psi, 'ApprovalForAll')
          .withArgs(this.owner.address, this.addr1.address, true);
        expect(await this.ERC721Psi.isApprovedForAll(this.owner.address, this.addr1.address)).to.be.true;
      });

      it('sets rejects approvals for non msg senders', async function () {
        await expect(this.ERC721Psi.connect(this.addr1).setApprovalForAll(this.addr1.address, true)).to.be.revertedWith(
          'ERC721Psi: approve to caller'
        );
      });
    });

    context('test transfer functionality', function () {
      const testSuccessfulTransfer = function (transferFn) {
        const tokenId = 1;
        let from;
        let to;

        beforeEach(async function () {
          const sender = this.addr2;
          from = sender.address;
          this.receiver = await this.ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE);
          to = this.receiver.address;
          await this.ERC721Psi.connect(sender).setApprovalForAll(to, true);
          this.transferTx = await this.ERC721Psi.connect(sender)[transferFn](from, to, tokenId);
        });

        it('transfers the ownership of the given token ID to the given address', async function () {
          expect(await this.ERC721Psi.ownerOf(tokenId)).to.be.equal(to);
        });

        it('emits a Transfer event', async function () {
          await expect(this.transferTx).to.emit(this.ERC721Psi, 'Transfer').withArgs(from, to, tokenId);
        });

        it('clears the approval for the token ID', async function () {
          expect(await this.ERC721Psi.getApproved(tokenId)).to.be.equal(ZERO_ADDRESS);
        });

        it('emits an Approval event', async function () {
          await expect(this.transferTx).to.emit(this.ERC721Psi, 'Approval').withArgs(from, ZERO_ADDRESS, tokenId);
        });

        it('adjusts owners balances', async function () {
          expect(await this.ERC721Psi.balanceOf(from)).to.be.equal(1);
        });

        it('adjusts owners tokens by index', async function () {
          expect(await this.ERC721Psi.tokenOfOwnerByIndex(to, 0)).to.be.equal(tokenId);
          expect(await this.ERC721Psi.tokenOfOwnerByIndex(from, 0)).to.be.not.equal(tokenId);
        });
      };

      const testUnsuccessfulTransfer = function (transferFn) {
        const tokenId = 1;

        it('rejects unapproved transfer', async function () {
          await expect(
            this.ERC721Psi.connect(this.addr1)[transferFn](this.addr2.address, this.addr1.address, tokenId)
          ).to.be.revertedWith('ERC721Psi: transfer caller is not owner nor approved');
        });

        it('rejects transfer from incorrect owner', async function () {
          await this.ERC721Psi.connect(this.addr2).setApprovalForAll(this.addr1.address, true);
          await expect(
            this.ERC721Psi.connect(this.addr1)[transferFn](this.addr3.address, this.addr1.address, tokenId)
          ).to.be.revertedWith('ERC721Psi: transfer of token that is not own');
        });

        it('rejects transfer to zero address', async function () {
          await this.ERC721Psi.connect(this.addr2).setApprovalForAll(this.addr1.address, true);
          await expect(
            this.ERC721Psi.connect(this.addr1)[transferFn](this.addr2.address, ZERO_ADDRESS, tokenId)
          ).to.be.revertedWith('ERC721Psi: transfer to the zero address');
        });
      };

      context('successful transfers', function () {
        describe('transferFrom', function () {
          testSuccessfulTransfer('transferFrom');
        });

        describe('safeTransferFrom', function () {
          testSuccessfulTransfer('safeTransferFrom(address,address,uint256)');

          it('validates ERC721Received', async function () {
            await expect(this.transferTx)
              .to.emit(this.receiver, 'Received')
              .withArgs(this.addr2.address, this.addr2.address, 1, '0x', GAS_MAGIC_VALUE);
          });
        });
      });

      context('unsuccessful transfers', function () {
        describe('transferFrom', function () {
          testUnsuccessfulTransfer('transferFrom');
        });

        describe('safeTransferFrom', function () {
          testUnsuccessfulTransfer('safeTransferFrom(address,address,uint256)');
        });
      });
    });
  });

  context('mint', async function () {
    beforeEach(async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      this.owner = owner;
      this.addr1 = addr1;
      this.addr2 = addr2;
      this.receiver = await this.ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE);
    });

    describe('safeMint', function () {
      it('successfully mints a single token', async function () {
        const mintTx = await this.ERC721Psi['safeMint(address,uint256)'](this.receiver.address, 1);
        await expect(mintTx).to.emit(this.ERC721Psi, 'Transfer').withArgs(ZERO_ADDRESS, this.receiver.address, 0);
        await expect(mintTx)
          .to.emit(this.receiver, 'Received')
          .withArgs(this.owner.address, ZERO_ADDRESS, 0, '0x', GAS_MAGIC_VALUE);
        expect(await this.ERC721Psi.ownerOf(0)).to.equal(this.receiver.address);
      });

      it('successfully mints multiple tokens', async function () {
        const mintTx = await this.ERC721Psi['safeMint(address,uint256)'](this.receiver.address, 5);
        for (let tokenId = 0; tokenId < 5; tokenId++) {
          await expect(mintTx).to.emit(this.ERC721Psi, 'Transfer').withArgs(ZERO_ADDRESS, this.receiver.address, tokenId);
          await expect(mintTx)
            .to.emit(this.receiver, 'Received')
            .withArgs(this.owner.address, ZERO_ADDRESS, 0, '0x', GAS_MAGIC_VALUE);
          expect(await this.ERC721Psi.ownerOf(tokenId)).to.equal(this.receiver.address);
        }
      });

      it('rejects mints to the zero address', async function () {
        await expect(this.ERC721Psi['safeMint(address,uint256)'](ZERO_ADDRESS, 1)).to.be.revertedWith(
          'ERC721Psi: mint to the zero address'
        );
      });

      it('requires quantity to be greater 0', async function () {
        await expect(this.ERC721Psi['safeMint(address,uint256)'](this.owner.address, 0)).to.be.revertedWith(
          'ERC721Psi: quantity must be greater 0'
        );
      });
    });
  });
});