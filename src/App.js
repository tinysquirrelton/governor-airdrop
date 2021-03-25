import React, { Component } from "react";
import Routes from "./routes";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { X } from "react-feather";



// * CONSTANTS
import { merkle } from "./data/constants/merkle";
import { GDAOAddress, rewardPoolAddress } from "./data/constants/constants";

// * ABI
import { GDAOABI } from "./data/abi/GDAOABI";

const Close = ({ closeToast }) => <X size={20} onClick={closeToast} />;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.merkle = merkle;
    this.GDAOABI = GDAOABI;
    this.GDAOAddress = GDAOAddress;
  }

  async componentDidMount() {
    this.connectWeb3();
  }

  // onConnect = () => {
  //   this.GDAOContract = new web3.eth.Contract(this.GDAOABI, this.GDAOAddress);
  //   this.airdropContract = new web3.eth.Contract(
  //     this.merkle.contractABI,
  //     this.merkle.contractAddress
  //   );
  // };

  // onResetConnect = () => {
  //   this.setState({
  //     isAirdropClaimed: false,
  //     isEligible: false,
  //   });
  // };

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
        <Routes />
      </>
    );
  }
}
