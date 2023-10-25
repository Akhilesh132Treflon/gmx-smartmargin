import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-tracer"
const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: "https://arbitrum-mainnet.infura.io/v3/2dff452478174fdf8035dc20eadb5667",
      }
    }
  }
};

export default config;
