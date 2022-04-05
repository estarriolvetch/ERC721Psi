const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");


describe("BitScan", function () {
  let bitscan;
  const ONE = BigNumber.from("1");
  before(async function(){
    const BitScan = await ethers.getContractFactory("BitScanMock");
    bitscan = await BitScan.deploy();
    await bitscan.deployed();
  });

  it("isolateLSB", async function () {
    for (let i = 0; i < 256; i++) {
      assert.equal(
        await bitscan.isolateLS1B256(ONE.shl(i)),
        ONE.shl(i).toString()
      );
    }

    for (let i = 0; i < 255; i++) {
      assert.equal(
        await bitscan.isolateLS1B256(ONE.shl(i).add(ONE.shl(i+1))),
        ONE.shl(i).toString()
      );
    }
  });

  it("isolateMSB", async function () {
    for (let i = 0; i < 256; i++) {
      assert.equal(
        await bitscan.isolateMS1B256(ONE.shl(i)),
        ONE.shl(i).toString()
      );
    }

    for (let i = 0; i < 255; i++) {
      assert.equal(
        await bitscan.isolateMS1B256(ONE.shl(i).add(ONE.shl(i+1))),
        ONE.shl(i+1).toString()
      );
    }
  });

  it("bitScanForward", async function () {
    for (let i = 0; i < 256; i++) {
      assert.equal(
        await bitscan.bitScanForward256(ONE.shl(i)),
        i
      );
    }

    for (let i = 0; i < 255; i++) {
      assert.equal(
        await bitscan.bitScanForward256(ONE.shl(i).add(ONE.shl(i+1))),
        i
      );
    }
  });

  it("bitScanReverse", async function () {
    for (let i = 0; i < 256; i++) {
      assert.equal(
        await bitscan.bitScanReverse256(ONE.shl(i)),
        255-i
      );
    }

    for (let i = 0; i < 255; i++) {
      assert.equal(
        await bitscan.bitScanReverse256(ONE.shl(i).add(ONE.shl(i+1))),
        255-i-1
      );
    }
  });
});
