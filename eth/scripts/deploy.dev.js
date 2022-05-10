const hre = require("hardhat");

async function main() {
    const {
        HARDHAT_NETWORK_URL
    } = process.env

    console.log("Network:", HARDHAT_NETWORK_URL);

    const signers = await hre.ethers.getSigners();
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

    // Deploy OOO token
    const OOO = await hre.ethers.getContractFactory("OOO");
    const ooo = await OOO.deploy("OOO", "One of One");
    await ooo.deployed();
    console.log("OOO: ", ooo.address);

    // Deploy Eggstravaganza
    const EEGG = await hre.ethers.getContractFactory("EEGG");
    const eegg = await EEGG.deploy();
    await eegg.deployed();
    console.log("eegg: ", eegg.address);


    // Minting
    console.log("Minting EGGs");
    await egg.connect(signers[0]).mint(5);
    console.log("Minting ANMLs");
    await anml.connect(signers[0]).mint(5);
    console.log("Minting HEGGs");
    await hegg.connect(signers[0]).mint(5);
    console.log("Minting HANMLs");
    await hanml.connect(signers[0]).mint(5);

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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });