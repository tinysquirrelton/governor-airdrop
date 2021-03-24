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


function initWeb3(provider: any) {
  const web3: any = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber
      }
    ]
  });

  return web3;
}

export default class Connect {
  constructor() {
    //this.web3 = new Web3(new Web3.providers.HttpProvider(ETH_ENDPOINT));
    this.web3 = null;
	this.provider = null;
	this.connected = false;
	this.address = null;
	this.chainId = null;
	this.networkId = null;
	
    this.web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions,
      disableInjectedProvider: false,
    });
  }

  connectWeb3Manual = async () => {
    this.web3Modal.clearCachedProvider();
    this.connectWeb3();
  }
  
  connectWeb3 = async () => {
    this.provider = await this.web3Modal.connect();
    await this.subscribeProvider(this.provider);
	
    this.web3 = initWeb3(this.provider);
    const accounts = await this.web3.eth.getAccounts();
    this.address = accounts[0];
	console.log(this.address);
    this.networkId = await this.web3.eth.net.getId();
    this.chainId = await this.web3.eth.chainId();
  };
  
  
  subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }
    provider.on("disconnect", () => this.resetApp());
    provider.on("accountsChanged", async (accounts: string[]) => {
	  this.address = accounts[0];
	  console.log(this.address);
    });
    provider.on("chainChanged", async (chainId: number) => {
      const networkId = await this.web3.eth.net.getId();
	  this.chainId = chainId;
	  this.networkId = networkId;
    });
  };

}
