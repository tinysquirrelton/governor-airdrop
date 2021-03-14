import React, { Component } from "react";
import Routes from "./routes";
import { ToastContainer } from "react-toastify";
import { X } from "react-feather";
import ConnectWallet from "./connectWallet";

const Close = ({ closeToast }) => <X size={20} onClick={closeToast} />;

const connection = new ConnectWallet();

export default class App extends Component {
  constructor(props) {
    super(props);
  }

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
		<Routes connection={connection}/>
      </>
    );
  }
}
