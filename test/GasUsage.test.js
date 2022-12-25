const { deployContract } = require('./helpers.js');

describe('ERC721Psi Gas Usage', function () {
  beforeEach(async function () {
    this.erc721Psi = await deployContract('ERC721PsiGasReporterMock', ['ERC721Psi', 'ERC721Psi']);
    const [owner, addr1] = await ethers.getSigners();
    this.owner = owner;
    this.addr1 = addr1;
  });

  context('mintOne', function () {
    it('runs mintOne 2 times', async function () {
      for (let i = 0; i < 2; i++) {
        await this.erc721Psi.mintOne(this.addr1.address);
      }
    });
  });

  context('safeMintOne', function () {
    it('runs safeMintOne 2 times', async function () {
      for (let i = 0; i < 2; i++) {
        await this.erc721Psi.safeMintOne(this.addr1.address);
      }
    });
  });

  context('mintTen', function () {
    it('runs mintTen 2 times', async function () {
      for (let i = 0; i < 2; i++) {
        await this.erc721Psi.mintTen(this.addr1.address);
      }
    });
  });

  context('safeMintTen', function () {
    it('runs safeMintTen 2 times', async function () {
      for (let i = 0; i < 2; i++) {
        await this.erc721Psi.safeMintTen(this.addr1.address);
      }
    });
  });

  context('transferFrom', function () {
    beforeEach(async function () {
      await this.erc721Psi.mintTen(this.owner.address);
      await this.erc721Psi.mintOne(this.owner.address);

      await this.erc721Psi.mintTen(this.addr1.address);
      await this.erc721Psi.mintOne(this.addr1.address);
    });

    it('transfer to and from two addresses', async function () {
      for (let i = 0; i < 2; ++i) {
        await this.erc721Psi.connect(this.owner).transferFrom(this.owner.address, this.addr1.address, 1);
        await this.erc721Psi.connect(this.addr1).transferFrom(this.addr1.address, this.owner.address, 1);
      }
    });

    it('transferTen ascending order', async function () {
      await this.erc721Psi.connect(this.owner).transferTenAsc(this.addr1.address);
    });

    it('transferTen descending order', async function () {
      await this.erc721Psi.connect(this.owner).transferTenDesc(this.addr1.address);
    });

    it('transferTen average order', async function () {
      await this.erc721Psi.connect(this.owner).transferTenAvg(this.addr1.address);
    });
  });
});
