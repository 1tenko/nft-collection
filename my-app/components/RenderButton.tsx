import React from "react";

const RenderButton: React.FC = () => {
  // if wallet is not connected, return a button which allows user to connect their waller
  if (!walletConnected) {
    return <button onClick={connectWallet}> Connect Your Wallet </button>;
  }
};

export default RenderButton;
