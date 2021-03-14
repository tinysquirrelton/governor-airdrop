import React, { Component } from "react";
import { toast } from "react-toastify";
import { ConnectButton } from "./elements";

// * ABI
import { GDAOABI } from "../../data/abi/GDAOABI";

// * CONSTANTS
import { GDAOAddress, rewardPoolAddress } from "../../data/constants/constants";
import { merkle } from "../../data/constants/merkle";

import "./style.scss";

import ConnectWallet from "../../connectWallet";

var connection = new ConnectWallet();

class Airdrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      isDropdownOpen: false,
      account: null,
      day: 0,
      percentage: 0,
      unclaimed: 0,
      burned: 0,
      reward: 0,
      claimable: 0,
      isAirdropClaimed: false,
      isEligible: false,
      isAirdropLive: false,
      countdownString: "0:0:0",
    };
    this.GDAOABI = GDAOABI;
    this.merkle = merkle;
    this.GDAOAddress = GDAOAddress;
    this.rewardPoolAddress = rewardPoolAddress;
    this.GDAOContract = null;
    this.airdropContract = null;
  }

  async componentDidMount() {
    let now = new Date().getTime();
    let startCountdown = this.merkle.startTimestamp * 1000;
    let self = this;
    if (startCountdown > now) {
      let countdownInterval = setInterval(function () {
        let now = new Date().getTime();
        let distance = startCountdown - now;

        let hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        let calculatedCountdownString = hours + ":" + minutes + ":" + seconds;
        self.setState({ countdownString: calculatedCountdownString });

        if (distance < 0) {
          self.setState({ isAirdropLive: true });
          clearInterval(countdownInterval);
        }
      }, 1000);
    } else {
      this.setState({ isAirdropLive: true });
    }
  }

  roundTo = (n, digits) => {
    var negative = false;
    if (digits === undefined) {
      digits = 0;
    }
    if (n < 0) {
      negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(digits);
    if (negative) {
      n = (n * -1).toFixed(digits);
    }
    return n;
  };

  getAirdropStats = () => {
    if (
      this.merkle.claims[
        this.web3.utils.toChecksumAddress(this.state.account)
      ] != null
    ) {
      this.setState({ isEligible: true });
    }

    let currentTimestamp = Math.round(Date.now() / 1000);
    let daysPassed =
      Math.round(
        (currentTimestamp - this.merkle.startTimestamp) / 60 / 60 / 24
      ) - 1;
    let rewardMultiplier = 0.1;

    if (daysPassed > 90) {
      rewardMultiplier = 1;
    } else if (daysPassed < 0) {
      rewardMultiplier = 0;
    } else {
      rewardMultiplier += daysPassed * 0.01;
    }

    let percentageToday = Math.round(rewardMultiplier * 100);

    this.setState({ percentage: percentageToday, day: daysPassed });

    if (this.airdropContract != null && this.GDAOContract != null) {
      this.GDAOContract.methods
        .balanceOf(this.merkle.contractAddress)
        .call()
        .then((result) => {
          this.setState({
            unclaimed: parseFloat(this.web3.utils.fromWei(result, "ether")),
          });
        });
      this.airdropContract.methods
        .burnAddress()
        .call()
        .then((burnAddress) => {
          this.GDAOContract.methods
            .balanceOf(burnAddress)
            .call()
            .then((result) => {
              this.setState({
                burned: parseFloat(this.web3.utils.fromWei(result, "ether")),
              });
            });
        });
      this.GDAOContract.methods
        .balanceOf(this.rewardPoolAddress)
        .call()
        .then((result) => {
          let rewardResult = parseFloat(
            this.web3.utils.fromWei(result, "ether")
          );

          this.setState({ reward: rewardResult });
        });
      if (this.state.isEligible) {
        this.airdropContract.methods
          .isClaimed(
            this.merkle.claims[
              this.web3.utils.toChecksumAddress(this.state.account)
            ].index
          )
          .call()
          .then((isClaimed) => {
            this.setState({
              isAirdropClaimed: isClaimed,
              claimable: this.roundTo(
                this.web3.utils.fromWei(
                  this.merkle.claims[
                    this.web3.utils.toChecksumAddress(this.state.account)
                  ].amount,
                  "ether"
                ) * rewardMultiplier,
                2
              ),
            });
          });
      }
    }
  };

  claimAirdrop = () => {
    if (this.web3 != null && this.airdropContract != null) {
      this.airdropContract.methods
        .claim(
          this.merkle.claims[
            this.web3.utils.toChecksumAddress(this.state.account)
          ].index,
          this.state.account,
          this.merkle.claims[
            this.web3.utils.toChecksumAddress(this.state.account)
          ].amount,
          this.merkle.claims[
            this.web3.utils.toChecksumAddress(this.state.account)
          ].proof
        )
        .send({
          from: this.state.account,
        })
        .on("error", function (error) {
          toast.error("Transaction was not successful");
        })
        .on("transactionHash", function (transactionHash) {
          toast.info(
            "Your transaction has been recorded. Click here to review your tx.",
            {
              onClick: function () {
                window.open(
                  "https://etherscan.io/tx/" + transactionHash,
                  "_blank"
                );
              },
            }
          );
        })
        .on("confirmation", function (confirmationNumber, receipt) {
          toast.success("You have successfully claimed your airdrop");
        });
    }
  };

  render() {
    return (
      <div className="max-width-container">
        <div className="airdrop-container">
          <div className="airdrop-title">
            <div className="title-text">GDAO Airdrop</div>
            <ConnectButton
              account={this.state.account}
              setConnection={connection.connectWeb3Manual}
            />
          </div>
          <div className="airdrop-subtitle">
            <span>Airdrop Day: </span>
            {this.state.day}
          </div>
          <div className="airdrop-subtitle">
            <span>Claimable GDAO: </span>
            {this.state.percentage}%
          </div>
          <div className="airdrop-subtitle">
            <a
              href="https://etherscan.io/address/0x7ea0f8bb2f01c197985c285e193dd5b8a69836c0#code"
              rel="noreferrer"
              target="_blank"
              style={{
                fontSize: "0.8em",
                color: "#ffffff",
                display: "inline-block",
                textAlign: "center",
              }}
            >
              Airdrop Contract
            </a>
          </div>

          <div className="airdrop-details">
            <div className="upper">
              <div className="details-item">
                <div className="title">Unclaimed GDAO</div>
                <div className="value">
                  {this.state.unclaimed.toLocaleString()}
                </div>
              </div>
              <div className="details-item">
                <div className="title">Reward Pool</div>
                <div className="value">
                  {this.state.reward.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="lower">
              {this.state.isAirdropLive ? (
                this.state.isConnected ? (
                  this.state.isEligible ? (
                    this.state.isAirdropClaimed ? (
                      <>
                        <div className="claim-item">
                          <div className="title">
                            You have already claimed your airdrop
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="claim-item">
                          <div className="title">Claimable GDAO</div>
                          <div className="value">
                            {this.state.claimable.toLocaleString()}
                          </div>
                        </div>
                        <button
                          className="claim-btn"
                          onClick={this.claimAirdrop}
                        >
                          Claim Airdrop
                        </button>
                      </>
                    )
                  ) : (
                    <>
                      <div className="claim-item">
                        <div className="title">
                          You are not eligible for this airdrop
                        </div>
                      </div>
                    </>
                  )
                ) : (
                  <div className="claim-disconnected">
                    <span>Wallet not connected</span>
                    <br />
                    Please, connect wallet to continue...
                  </div>
                )
              ) : (
                <>
                  <div className="claim-item">
                    <div className="title">The airdrop starts in</div>
                    <div className="title" id="countdownToStart">
                      {this.state.countdownString}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="gdao-texture-bg" />
        <div className="gdao-phoenix-bg" />
      </div>
    );
  }
}

export default Airdrop;
