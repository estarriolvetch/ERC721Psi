const { expect } = require('chai')
const { constants } = require('@openzeppelin/test-helpers')
const { BigNumber } = require('ethers')
const { ZERO_ADDRESS } = constants

const RECEIVER_MAGIC_VALUE = '0x150b7a02'

describe('ERC721PsiOverrideStartId', function () {
    beforeEach(async function () {
        const factory = await ethers.getContractFactory('ERC721PsiOverrideStartIdMock')
        this.ERC721Psi = await factory.deploy('ERC721Psi', 'ERC721Psi')
        await this.ERC721Psi.deployed()
    })

    context('with no minted tokens', async function () {
        it('has 0 totalSupply', async function () {
            const supply = await this.ERC721Psi.totalSupply()
            expect(supply).to.equal(0)
        })
    })

    context('with minted tokens', async function () {
        beforeEach(async function () {
            const [owner, addr1, addr2, addr3] = await ethers.getSigners()
            this.owner = owner
            this.addr1 = addr1
            this.addr2 = addr2
            this.addr3 = addr3
            await this.ERC721Psi['safeMint(address,uint256)'](addr1.address, 1)
            await this.ERC721Psi['safeMint(address,uint256)'](addr2.address, 2)
            await this.ERC721Psi['safeMint(address,uint256)'](addr3.address, 3)
        })

        it('has 6 totalSupply', async function () {
            const supply = await this.ERC721Psi.totalSupply()
            expect(supply).to.equal(6)
        })

        describe('exists', async function () {
            it('verifies valid tokens', async function () {
                // check 1 to 6 because this mock starts at 1
                for (let tokenId = 1; tokenId <= 6; tokenId++) {
                    const exists = await this.ERC721Psi.exists(tokenId)
                    expect(exists).to.be.true
                }
            })

            it('verifies invalid tokens', async function () {
                const exists = await this.ERC721Psi.exists(7)
                expect(exists).to.be.false
            })
        })

        describe('balanceOf', async function () {
            it('returns the amount for a given address', async function () {
                expect(await this.ERC721Psi.balanceOf(this.owner.address)).to.equal('0')
                expect(await this.ERC721Psi.balanceOf(this.addr1.address)).to.equal('1')
                expect(await this.ERC721Psi.balanceOf(this.addr2.address)).to.equal('2')
                expect(await this.ERC721Psi.balanceOf(this.addr3.address)).to.equal('3')
            })

            it('throws an exception for the 0 address', async function () {
                await expect(this.ERC721Psi.balanceOf(ZERO_ADDRESS)).to.be.revertedWith(
                    'ERC721Psi: balance query for the zero address'
                )
            })
        })

        describe('ownerOf', async function () {
            it('returns the right owner', async function () {
                expect(await this.ERC721Psi.ownerOf(1)).to.equal(this.addr1.address)
                expect(await this.ERC721Psi.ownerOf(2)).to.equal(this.addr2.address)
                expect(await this.ERC721Psi.ownerOf(6)).to.equal(this.addr3.address)
            })

            it('reverts for an invalid token', async function () {
                await expect(this.ERC721Psi.ownerOf(10)).to.be.revertedWith('ERC721Psi: owner query for nonexistent token')
            })
        })

        describe('tokensOfOwner', async function () {
            it('returns the right owner list', async function () {
                expect(await this.ERC721Psi.tokensOfOwner(this.addr1.address)).to.eqls([new BigNumber.from("1")])
                expect(await this.ERC721Psi.tokensOfOwner(this.addr2.address)).to.eqls([new BigNumber.from("2"), new BigNumber.from("3")])
                expect(await this.ERC721Psi.tokensOfOwner(this.addr3.address)).to.eqls([new BigNumber.from("4"), new BigNumber.from("5"), new BigNumber.from("6")])
            })
        })

        describe('approve', async function () {
            const tokenId = 1
            const tokenId2 = 2

            it('sets approval for the target address', async function () {
                await this.ERC721Psi.connect(this.addr1).approve(this.addr2.address, tokenId)
                const approval = await this.ERC721Psi.getApproved(tokenId)
                expect(approval).to.equal(this.addr2.address)
            })

            it('rejects an invalid token owner', async function () {
                await expect(this.ERC721Psi.connect(this.addr1).approve(this.addr2.address, tokenId2)).to.be.revertedWith(
                    'ERC721Psi: approval to current owner'
                )
            })

            it('rejects an unapproved caller', async function () {
                await expect(this.ERC721Psi.approve(this.addr2.address, tokenId)).to.be.revertedWith(
                    'ERC721Psi: approve caller is not owner nor approved for all'
                )
            })

            it('does not get approved for invalid tokens', async function () {
                await expect(this.ERC721Psi.getApproved(10)).to.be.revertedWith('ERC721Psi: approved query for nonexistent token')
            })
        })

        describe('setApprovalForAll', async function () {
            it('sets approval for all properly', async function () {
                const approvalTx = await this.ERC721Psi.setApprovalForAll(this.addr1.address, true)
                await expect(approvalTx)
                    .to.emit(this.ERC721Psi, 'ApprovalForAll')
                    .withArgs(this.owner.address, this.addr1.address, true)
                expect(await this.ERC721Psi.isApprovedForAll(this.owner.address, this.addr1.address)).to.be.true
            })

            it('sets rejects approvals for non msg senders', async function () {
                await expect(this.ERC721Psi.connect(this.addr1).setApprovalForAll(this.addr1.address, true)).to.be.revertedWith(
                    'ERC721Psi: approve to caller'
                )
            })
        })
    })

    context('mint', async function () {
        beforeEach(async function () {
            const [owner, addr1, addr2] = await ethers.getSigners()
            this.owner = owner
            this.addr1 = addr1
            this.addr2 = addr2
            this.receiver = await this.ERC721Receiver.deploy(RECEIVER_MAGIC_VALUE)
        })
    })
})