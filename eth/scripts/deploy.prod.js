const hre = require("hardhat");

async function main() {
    const {
        HARDHAT_NETWORK_URL
    } = process.env

    console.log("Network:", HARDHAT_NETWORK_URL);

    const signer = await hre.ethers.getSigner();

    const {
        PROD_ZOO_ADDRESS,
        PROD_EGG_ADDRESS,
        PROD_HEGG_ADDRESS,
        PROD_ANML_ADDRESS,
        PROD_HANML_ADDRESS,
    } = process.env;

    // Deploy AH
    const AuctionHouse = await hre.ethers.getContractFactory("AuctionHouse");
    const auctionHouse = await AuctionHouse.deploy();
    await auctionHouse.deployed();
    console.log("AH: ", auctionHouse.address);

    // // Configure AH
    // await auctionHouse.connect(signer).setCurrency(PROD_ZOO_ADDRESS)
    // await auctionHouse.connect(signer).setContractAllowed(PROD_EGG_ADDRESS, true)
    // await auctionHouse.connect(signer).setContractAllowed(PROD_HEGG_ADDRESS, true)
    // await auctionHouse.connect(signer).setContractAllowed(PROD_ANML_ADDRESS, true)
    // await auctionHouse.connect(signer).setContractAllowed(PROD_HANML_ADDRESS, true)
    // // await auctionHouse.connect(signer).togglePause()
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });