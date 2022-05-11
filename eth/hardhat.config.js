require("@nomiclabs/hardhat-waffle");

const {
  HARDHAT_NETWORK_URL,
  HARDHAT_CHAIN_ID,
} = process.env;

const config = {
  solidity: "0.8.4",
  defaultNetwork: "default",
  networks: {
    "default": {
      url: HARDHAT_NETWORK_URL,
      chainId: Number(HARDHAT_CHAIN_ID),
    },
  }
};

console.log(config);

module.exports = config;
