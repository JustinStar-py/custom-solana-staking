import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import Staking from './components/Staking.js';
import Header from './components/Header.js';
import MessageBox from './components/Loading.js';
import { MD5 } from 'crypto-js'; 
import axios from 'axios';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connection, setConnection] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);

  // for message box
  const [messageInfo, setMessageInfo] = useState({
    messageText: null,
    messageType: null, // default to 'success', 'error', 'loading'
    isLoading: false,
    boxType: 'transaction'
  });

  useEffect(() => {
    if (walletAddress) {
      axios.post('http://localhost:5000/signup', {
          "walletAddress": walletAddress.publicKey, 
          "userId": MD5(walletAddress.publicKey).toString(), 
          "pool": 1
      })
      .then(response => {
          console.log(response); // Log the response data
      })
      .catch(error => {
          console.error('There was a problem with the axios request:', error);
      });
   }
  }, [walletAddress])

  return (
    <div className="App">
       <Header walletAddress={walletAddress} setWalletAddress={setWalletAddress} setConnection={setConnection} setWalletProvider={setWalletProvider} />
       <Staking userAddress={walletAddress} walletProvider={walletProvider} connection={connection} messageInfo={messageInfo} setMessageInfo={setMessageInfo} />
       {messageInfo.messageType !== null &&
         <MessageBox 
           messageInfo={messageInfo}
           setMessageInfo={setMessageInfo}
         />
       }
    </div>
  );
}

export default App;
