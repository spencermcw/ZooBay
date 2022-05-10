const {
    expect
} = require("chai");
const {
    ethers
} = require("hardhat");


describe("Auction House", function() {
    let egg, zoo, auctionHouse;
    // const signers = await ethers.getSigners();

    before(async function() {
        // Deploy ZOO token
        const ZOO = await hre.ethers.getContractFactory("ZOO");
        zoo = await ZOO.deploy();
        await zoo.deployed();

        // Deploy EGG token
        const EGG = await hre.ethers.getContractFactory("EGG");
        egg = await EGG.deploy();
        await egg.deployed();

        // Deploy AH
        const AuctionHouse = await hre.ethers.getContractFactory("AuctionHouse");
        auctionHouse = await AuctionHouse.deploy();
        await auctionHouse.deployed();
    });

    it("Should Configure AH", async function() {
        const owner = await ethers.getSigner();
        await expect(auctionHouse.connect(owner).setCurrency(zoo.address)).not.reverted;
        await expect(auctionHouse.connect(owner).setContractAllowed(egg.address, true)).not.reverted;
        await expect(auctionHouse.connect(owner).togglePause()).not.reverted;
    });

    it("Should Mint Eggs", async function() {
        const signers = await ethers.getSigners();
        await expect(egg.connect(signers[1]).mint(5)).not.reverted;
        expect((await egg.balanceOf(signers[1].address)).eq(5)).true;
    });

    it("Should Create Listing", async function() {
        const signers = await ethers.getSigners();
        await expect(egg.connect(signers[1]).setApprovalForAll(auctionHouse.address, true)).not.reverted;
        await expect(auctionHouse.connect(signers[1]).createListing(
            [egg.address],
            [[0]],
            60 * 60 * 24,
            999,
            1
        )).not.reverted;
        expect((await auctionHouse.listingsByCreator(signers[1].address)).length).eq(1);
    });

    it("Should Cancel a Listing", async function() {
        const signers = await ethers.getSigners();
        await expect(egg.connect(signers[1]).setApprovalForAll(auctionHouse.address, true)).not.reverted;
        await expect(auctionHouse.connect(signers[1]).createListing(
            [egg.address],
            [[1]],
            60 * 60 * 24,
            999,
            1
        )).not.reverted;
        expect((await auctionHouse.listingsByCreator(signers[1].address)).length).eq(2);
        await expect(auctionHouse.connect(signers[1]).cancelListing(2)).not.reverted;
        // console.log(await auctionHouse.listingsByCreator(signers[1].address))
        // console.log(await auctionHouse.listings(2))
        // console.log(await auctionHouse.listingBids(2))
    });

    it("Should Bid on a Listing", async function() {
        const signers = await ethers.getSigners();
        const bidder = signers[2];
        await expect(zoo.connect(bidder).mint(ethers.utils.parseEther("9999"))).not.reverted;
        await expect(zoo.connect(bidder).approve(auctionHouse.address, 2)).not.reverted;
        await expect(auctionHouse.connect(bidder).createBid(1, 2)).not.reverted;
        expect((await auctionHouse.bidsByBidder(bidder.address)).length).eq(1)
        // console.log(await auctionHouse.listingBids(1))
        // console.log(await auctionHouse.bidsByBidder(bidder.address))
        // console.log(await auctionHouse.bids(1))
    });

});
