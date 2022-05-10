const hre = require("hardhat");

async function main() {
    const {
        HARDHAT_NETWORK
    } = process.env

    console.log("Network:", HARDHAT_NETWORK);

    // const signers = await hre.ethers.getSigners();
    const signer = await hre.ethers.getSigner();

    // Deploy ZOO token
    const ZOO = await hre.ethers.getContractFactory("ZOO");
    const zoo = await ZOO.deploy();
    await zoo.deployed();
    console.log("ZOO: ", zoo.address);

    // Deploy AH
    const AuctionHouse = await hre.ethers.getContractFactory("AuctionHouse");
    const auctionHouse = await AuctionHouse.deploy();
    await auctionHouse.deployed();
    console.log("AH: ", auctionHouse.address);

    // Deploy EGG token
    const EGG = await hre.ethers.getContractFactory("EGG");
    const egg = await EGG.deploy();
    await egg.deployed();
    console.log("EGG: ", egg.address);

    // Deploy ANML token
    const ANML = await hre.ethers.getContractFactory("ANML");
    const anml = await ANML.deploy();
    await anml.deployed();
    console.log("ANML: ", anml.address);

    // Deploy HEGG token
    const HEGG = await hre.ethers.getContractFactory("HEGG");
    const hegg = await HEGG.deploy();
    await hegg.deployed();
    console.log("HEGG: ", hegg.address);

    // Deploy ANML token
    const HANML = await hre.ethers.getContractFactory("HANML");
    const hanml = await HANML.deploy();
    await hanml.deployed();
    console.log("HANML: ", hanml.address);

    // Configure AH
    console.log("Configuring AH");
    await auctionHouse.connect(signer).setCurrency(zoo.address);
    await auctionHouse.connect(signer).setContractAllowed(egg.address, true);
    await auctionHouse.connect(signer).setContractAllowed(anml.address, true);
    await auctionHouse.connect(signer).setContractAllowed(hegg.address, true);
    await auctionHouse.connect(signer).setContractAllowed(hanml.address, true);
    console.log("Unpausing");
    await auctionHouse.connect(signer).togglePause();

    // Approvals
    console.log("Setting Approvals");
    await egg.connect(signer).setApprovalForAll(auctionHouse.address, true);
    await anml.connect(signer).setApprovalForAll(auctionHouse.address, true);
    await hegg.connect(signer).setApprovalForAll(auctionHouse.address, true);
    await hanml.connect(signer).setApprovalForAll(auctionHouse.address, true);

    // Listings
    const runs = 15
    console.log('minting eggs')
    await egg.connect(signer).mint(runs);

    for (let i = 0; i < runs; i++) {
        console.log('Creating Listing', i);
        await auctionHouse.connect(signer).createListing(
            [egg.address],
            [[i]],
            "1",
            "0",
            hre.ethers.utils.parseEther("100")
        );
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });