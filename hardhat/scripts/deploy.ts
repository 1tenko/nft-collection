import { ethers } from "hardhat";
require("dotenv").config({ path: ".env" });
import { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } from "../constants";

async function main() {
  // address of the whitelist contract deployed
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // url from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;

  // A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  // so cryptoDevsContract here is a factory for instances of our CryptoDevs contract.
  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

  // deploy the contract
  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
    metadataURL,
    whitelistContract
  );

  // print address of deployed contract
  console.log(
    "Crypto Devs Contract Address: ",
    deployedCryptoDevsContract.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
