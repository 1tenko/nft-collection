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
  const [isOwner, setisOwner] = useState(false);
  // keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // reference to the Web3 Modal (used for connecting metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

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
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
};

export default Home;
