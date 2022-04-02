import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import compiledContract from "./solidity/Messenger.json";
import "./App.css";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [data, setData] = useState([]);


  const contractAddress = "0x5AD263E9805E1c160c50374f9ed2d5E8ce001DC9";

  const contractABI = compiledContract.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }


  const fetchData = async () => {

    try {
      setLoading(true);
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messengerContract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log('messengerContract :>> ', messengerContract);

        let count = await messengerContract.getTotalNumberOfMessages();
        console.log("Retrieved total messages count...", count.toNumber());
        const messages = await messengerContract.getAllMessages();

        let messagesCleaned = [];
        messages.forEach(message => {
          messagesCleaned.push({
            address: message.from,
            timestamp: new Date(message.timestamp * 1000),
            message: message.message
          });
        });

        console.log("Retrieved all messages...", messages);
        setData(messagesCleaned);
        setCount(count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

  }

  const sendData = async (message) => {
    try {
      const { ethereum } = window;
      setMining(true);
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messengerContract = new ethers.Contract(contractAddress, contractABI, signer);


        const messenger = await messengerContract.sendMessage(message, { gasLimit: 300000 });
        console.log("Mining...", messenger.hash);

        await messenger.wait();
        console.log("Mined -- ", messenger.hash);


        // await fetchData();
        setMessage("")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
    finally {
      setMining(false);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    fetchData();
  }, [])


  /**
 * Listen in for emitter events!
 */


  useEffect(() => {
    let messengerContract;

    const newMessage = (from, timestamp, message) => {
      console.log("NewMessage", from, timestamp, message);
      setData(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      messengerContract = new ethers.Contract(contractAddress, contractABI, signer);
      messengerContract.on("NewMessage", newMessage);
    }

    return () => {
      if (messengerContract) {
        messengerContract.off("NewMessage", newMessage);
      }
    };
  }, []);


  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Web 3 project
        </div>

        <textarea value={message}
          type="text" placeholder="Enter your message" onChange={(e) => setMessage(e.target.value)}
        />
        <button className="waveButton" onClick={() => sendData(message)}>
          Store message
        </button>


        <button className="waveButton" onClick={fetchData}> {mining ? "Mining..." : "Retrieve all messages"}
        </button>

        <br />
        Current number of records - {loading ? "Loading..." : count}
        <br />

        <br />

        {data.map((message, index) => {
          return (
            <div key={index}>
              <div>Address: <b>{message.address}</b></div>
              <div>Time: <b>{message.timestamp.toString()}</b></div>
              <div>Message: <b>{message.message}</b></div>
              <br />
            </div>)
        })}


        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default App