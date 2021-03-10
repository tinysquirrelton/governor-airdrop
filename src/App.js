import React, { Component } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import Routes from "./routes";
import { ToastContainer } from "react-toastify";
import { X } from "react-feather";

const Close = ({ closeToast }) => <X size={20} onClick={closeToast} />;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "e35323bc24d243c6a971cefcaaa55953",
    },
  },
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.web3 = null;
    this.web3Modal = null;
    this.provider = null;
  }

  async componentDidMount() {
    this.getWeb3();
  }

  getWeb3 = async () => {
    this.web3Modal = new Web3Modal({
      cacheProvider: false,
      disableInjectedProvider: false,
      network: "mainnet",
      providerOptions,
    });
    this.provider = await this.web3Modal
      .connect("walletconnect")
      .then((res) => (this.web3 = new Web3(res)))
      .catch(() => null);
  };

  render() {
    return (
      <>
        <ToastContainer
          position={"bottom-right"}
          autoClose={3000}
          closeButton={<Close />}
          pauseOnFocusLoss={false}
          draggable={true}
          draggablePercent={25}
        />
        <Routes
          web3={this.web3}
          web3Modal={this.web3Modal}
          provider={this.provider}
          getWeb3={this.getWeb3}
        />
      </>
    );
  }
}
