import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import ipfs from "./ipfs";

import "./css/oswald.css";
import "./css/open-sans.css";
import "./css/pure-min.css";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      buffer: null,
      ipfsHash: "",
      account: null
    };
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const Contract = truffleContract(SimpleStorageContract);
      Contract.setProvider(web3.currentProvider);
      this.instance = await Contract.deployed();
      console.log(accounts);
      this.setState({ account: accounts[0] });
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: this.instance });
      const ipfsHash = await this.instance.get({ from: this.state.account });
      this.setState({ ipfsHash });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  captureFile(e) {
    e.preventDefault();
    const file = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log(this.state.buffer);
    };
  }

  onSubmit(e) {
    e.preventDefault();
    ipfs.files.add(this.state.buffer, async (err, res) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(this.state.account);
      try {
        const a = await this.instance.set(res[0].hash, {
          from: this.state.account
        });
        console.log(a);
      } catch (error) {
        console.log(error);
      }
      const ipfsHash = await this.instance.get({ from: this.state.account });
      this.setState({ ipfsHash });
      console.log(this.state.ipfsHash);
    });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#!" className="pure-menu-heading pure-menu-link">
            IPFS File upload dapp
          </a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Your Image</h1>
              <p>This image is stored on IPFS & The Ethereum Blockchain!</p>
              {this.state.ipfsHash && (
                <img
                  src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`}
                  alt="uploads"
                />
              )}
              <h2>Upload Image</h2>
              <form onSubmit={this.onSubmit}>
                <input type="file" onChange={this.captureFile} />
                <input type="submit" />
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
