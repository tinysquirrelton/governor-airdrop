import React, { Component } from "react";
import Routes from "./routes";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { X } from "react-feather";

// * WEB3
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

// * CONSTANTS
import { merkle } from "./data/constants/merkle";
import { GDAOAddress, rewardPoolAddress } from "./data/constants/constants";

// * ABI
import { GDAOABI } from "./data/abi/GDAOABI";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "e35323bc24d243c6a971cefcaaa55953", // required
    },
  },
};

function initWeb3(provider) {
  const web3 = new Web3(provider);
  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });

  return web3;
}

const Close = ({ closeToast }) => <X size={20} onClick={closeToast} />;

export default class App extends Component {
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
    this.merkle = merkle;
    this.GDAOABI = GDAOABI;
    this.GDAOAddress = GDAOAddress;
    this.web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions,
      disableInjectedProvider: false,
    });
  }

  async componentDidMount() {
    this.connectWeb3();
  }

  connectWeb3Manual = async () => {
    await this.resetApp();
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
      // this cannot be here for our WalletConnect to be generic
      this.GDAOContract = new web3.eth.Contract(this.GDAOABI, this.GDAOAddress);
      this.airdropContract = new web3.eth.Contract(
        this.merkle.contractABI,
        this.merkle.contractAddress
      );
    } else {
      this.setState({ account: null });
      toast.error("You need to be on the Ethereum Mainnet");
    }
  };

  subscribeProvider = async (provider) => {
    if (!provider.on) {
      return;
    }
    provider.on("disconnect", () => this.resetApp());
    provider.on("accountsChanged", async (accounts) => {
      await this.setState({ account: accounts[0] });
      if (accounts[0] == null) {
        this.resetApp();
      }
    });

    provider.on("chainChanged", async (chainId) => {
      const { web3 } = this.state;
      const networkId = await web3.eth.net.getId();
      await this.setState({ chainId, networkId });
    });

    provider.on("networkChanged", async (networkId) => {
      const { web3 } = this.state;
      const chainId = await web3.eth.chainId();
      await this.setState({ chainId, networkId });
    });
  };

  resetApp = async () => {
    const { web3 } = this.state;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
    this.setState({
      account: "",
      web3: null,
      provider: null,
      isConnected: false,
      chainId: 1,
      networkId: 1,
      result: null,
      // this cannot be here for our WalletConnect to be generic
      isAirdropClaimed: false,
      isEligible: false,
    });
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
          account={this.state.account}
          connectWeb3Manual={this.connectWeb3Manual}
        />
      </>
    );
  }
}
