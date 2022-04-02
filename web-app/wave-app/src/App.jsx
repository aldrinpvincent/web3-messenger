import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import compiledContract from "./solidity/Messenger.json";
import { getEthereumWalletAccount } from "./utils/getEthereumWallet";
import "./App.css";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [data, setData] = useState([]);

  const contractAddress = "0x5AD263E9805E1c160c50374f9ed2d5E8ce001DC9";
  const contractABI = compiledContract.abi;

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [status, address] = await getEthereumWalletAccount();
      console.log('status, address :>> ', status, address);
      if (status) {
        setCurrentAccount(address);
      }
      setLoading(false);
    }

    init();

  }, []);


  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("MetaMask not installed!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected to account: ", accounts[0]);
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
        // setCount(count.toNumber());

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


  /**
 * Listen in for emitter events!
 */

  useEffect(() => {
    let messengerContract;

    const newMessage = (from, timestamp, message) => {
      console.log("NewMessage", from, timestamp, message);
      setLoading(true);
      setData(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
      setLoading(false);
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
    <div className="container">
      <h1>
        👋 Web3 Messenger
      </h1>
      <div className="messenger-form">
        {currentAccount ? (
          <>
            <textarea value={message} rows="4" cols="50"
              type="text" placeholder="Enter your message" onChange={(e) => setMessage(e.target.value)}
            />
            <button className="p-btn" onClick={() => sendData(message)}>
              {mining ? "Loading..." : "Send message"}
            </button>
            <button className="p-btn" onClick={fetchData}> {loading ? "Fetching..." : "Fetch all messages"}
            </button>
          </>

        ) : (
          <button className="p-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>

      {loading && <p className="info">Fetching all messages...</p>}


      {data.length > 0 &&
        <>
          <br />
          <span className="info">Current number of messages: </span>  <b>{data.length}</b>
          <br />
          <br />
          <div className="messages">
            {data.map((message, index) => {
              return (
                <div key={index} className="message">
                  <div className="from">{message.address} </div>
                  <div className="text"> {message.message}</div>
                  <div className="time">{new Date(message.timestamp).toLocaleString()}</div>
                </div>)
            })}
          </div>
        </>}
    </div>
  );
}

export default App