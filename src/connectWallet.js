import React, { Component } from "react";
import { toast } from "react-toastify";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "e35323bc24d243c6a971cefcaaa55953", // required
    },
  },
};

const initWeb3 = async (provider) => {
  const web3 = new Web3(provider);
  await web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });
  return web3;
};

export default class WalletConnect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      account: "",
      web3: null,
      provider: null,
      chainId: 1,
      networkId: 1,
    };
    this.web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions,
      disableInjectedProvider: false,
    });
  }

  connectWeb3Manual = async () => {
    await this.resetConnection();
    this.connectWeb3();
  };

  connectWeb3 = async () => {
    const provider = await this.web3Modal.connect();
    await this.subscribeProvider(provider);
    const web3 = initWeb3(provider);
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const networkId = await web3.eth.net.getId();
    const chainId = await web3.eth.chainId();

    await this.setState({
      web3,
      provider,
      isConnected: true,
      account,
      chainId,
      networkId,
    });

    if (chainId === 1) {
      this.props.onConnect();
    } else {
      this.setState({ account: null });
      toast.error("You need to be on the Ethereum Mainnet");
    }
  };

  subscribeProvider = async (provider) => {
    if (!provider.on) {
      return;
    }
    provider.on("disconnect", () => this.resetConnection());
    provider.on("accountsChanged", async (accounts) => {
      await this.setState({ account: accounts[0] });
      if (accounts[0] == null) {
        this.resetConnection();
      }
    });
    provider.on("chainChanged", async (chainId) => {
      const networkId = await this.state.web3.eth.net.getId();
      await this.setState({ chainId, networkId });
    });
    provider.on("networkChanged", async (networkId) => {
      const chainId = await this.state.web3.eth.chainId();
      await this.setState({ chainId, networkId });
    });
  };

  resetConnection = async () => {
    if (
      this.state.web3 &&
      this.state.web3.currentProvider &&
      this.state.web3.currentProvider.close
    ) {
      await this.state.web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
    await this.setState({
      isConnected: false,
      account: "",
      web3: null,
      provider: null,
      chainId: 1,
      networkId: 1,
    });
    this.props.onResetConnect();
  };
}
