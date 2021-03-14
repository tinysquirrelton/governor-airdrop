import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const providerOptions = {
  injected: {
    display: {
      logo: "data:image/gif;base64,INSERT_BASE64_STRING",
      name: "Injected",
      description: "Connect with the provider in your Browser",
    },
    package: null,
  },
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "e35323bc24d243c6a971cefcaaa55953", // required
    },
  },
};

export default class Connect {
  constructor() {
    //this.web3 = new Web3(new Web3.providers.HttpProvider(ETH_ENDPOINT));
    this.web3Modal = null;

    this.connectWeb3();
  }

  connectWeb3Manual = async () => {
    this.web3Modal.clearCachedProvider();
    this.connectWeb3();
  };

  connectWeb3 = async () => {
    console.log("ok");

    this.web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions,
      disableInjectedProvider: false,
    });

    const provider = await this.web3Modal.connect();

    const web3 = new Web3(provider);

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts: string[]) => {
      console.log("accountsChanged");
      console.log(accounts);
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId: number) => {
      console.log("chainChanged");
      console.log(chainId);
    });

    // Subscribe to provider connection
    provider.on("connect", (info: { chainId: number }) => {
      console.log("connected");
      console.log(info);
    });

    // Subscribe to provider disconnection
    provider.on("disconnect", (error: { code: number, message: string }) => {
      console.log("disconnected");
      console.log(error);
    });
  };
}
