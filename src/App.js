import React, { useState } from 'react';
import logo from './logo.svg';
import Staking from './components/Staking.js';
import Header from './components/Header.js';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connection, setConnection] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);

  return (
    <div className="App">
       <Header walletAddress={walletAddress} setWalletAddress={setWalletAddress} setConnection={setConnection} setWalletProvider={setWalletProvider} />
       <Staking userAddress={walletAddress} walletProvider={walletProvider} connection={connection} />
    </div>
  );
}

export default App;
