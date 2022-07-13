import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Contract, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  // keeps track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState(false);
  // keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState(false);
  // set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the current connected metamask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // reference to the Web3 Modal (used for connecting metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  // returns a provider or signer object representing the Ethereum RPC with or without the signing capabilities of metamask attached
  // true if you need signer, default false otherwise
  const getProviderOrSigner = async (needSigner = false) => {
    // connect to metamask
    // since we store 'web3Modal' as a reference, we need o access the 'current' value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // if user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // Mint an NFT during the presale
  const presaleMint = async () => {
    try {
      // we need signer here since this is a 'write' transaction
      const signer = await getProviderOrSigner(true);
      // create new instance of the Contract with a Signer, which allows update methods
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call presaleMint from the contract, only whitelisted addresses would be able to mint
      const tx = await whitelistContract.presaleMint({
        // value signifies the cost of one crypto dev which is '0.01' eth.
        // we are parsing '0.01' string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  // mint an NFT after the presale
  const publicMint = async () => {
    try {
      // we need signer here since this is a 'write' transaction
      const signer = await getProviderOrSigner(true);
      // create new instance of the Contract with a Signer, which allows update methods
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call presaleMint from the contract, only whitelisted addresses would be able to mint
      const tx = await whitelistContract.presaleMint({
        // value signifies the cost of one crypto dev which is '0.01' eth.
        // we are parsing '0.01' string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      // get the provider from web3Modal, which in our case is metamask
      // when used for the first time,  it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // starts the presale for the NFT collection
  const startPresale = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // start the presale from the contract
      const tx = await whitelistContract.startPresale();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // set presale started to true
      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

  // calls the contract to retrieve the owner
  const getOwner = async () => {
    try {
      // no need for signer as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      // call the owner function from the contract
      const _owner = await nftContract.owner();
      // get signer now to extract the address of the currently connected metamask account
      const signer = await getProviderOrSigner(true);
      // get address associated to the signer which is connected to metamask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // checks if the presale has started by querying the 'presaleStarted' variable in the contract
  const checkIfPresaleStarted = async () => {
    try {
      // no need for signer here as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the presaleStarted from the contract
      const _presaleStarted = await nftContract.presaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // checks if the presale has ended by querying the 'presaleEnded' variable in the contract
  const checkIfPresaleEnded = async () => {
    try {
      // no need for signer as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      const _presaleEnded = await nftContract.presaleEnded();
      // _presaleEnded is a BigNumber, so we the lt (less than function) instead of '<'
      // Date.now()/1000 returns the current time in seconds
      // we compare if the _presaleEnded timestamp is less than the current time
      // which then means the presale has ended
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // gets the number of tokenIds that have been minted
  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _tokenIds = await nftContract.tokenIds();

      // _tokenIds is a BigNumber so we need to convert it to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {/* {renderButton()} */}
        </div>
        <div>
          <img className={styles.image} src="./0CDNFT.svg" />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Tenko</footer>
    </div>
  );
};

export default Home;
