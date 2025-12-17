import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY!],
    },
  },

  verify: {
    etherscan: {
      apiKey: {
        baseSepolia: process.env.ETHERSCAN_API_KEY!,
      },
    },
  },
};

export default config;
