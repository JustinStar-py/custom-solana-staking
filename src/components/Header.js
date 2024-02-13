import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, SystemProgram, clusterApiUrl, Keypair } from '@solana/web3.js';
import { styled } from '@mui/material/styles';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

// styled button
const ConnectButton = styled(Button)(({ theme }) => ({
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: '600',
    height: '48px',
    lineHeight: '48px',
    padding: '0 24px',
    borderRadius: '4px',
    textTransform: 'Uppercase',
    borderRadius: '10px',
    boxShadow: '-3px 3px 1px rgb(81 45 168 / 13%)',
    '&:hover': {
      boxShadow: '-2px 2px 1px rgb(81 45 168 / 1%)',
    },
}));

const Header = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    try {
      const { solana } = window;
      
      if (solana && solana.isPhantom) {
        console.log('Phantom wallet found!');
        
        // Connect to the wallet
        const response = await solana.connect();
        console.log('Connected with Public Key:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  return (
    <AppBar position="static" elevation={1} sx={{background: 'transparent', color: 'white', mt:'5px'}}>
      <Toolbar>
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" sx={{background: 'linear-gradient(45deg, #00ff96, #7919ff)', borderRadius: '10px', padding: '5px 8px' }}>
          <Typography variant="h6">
            My DApp
          </Typography>
          <Box>
            {/* Navigation items as list items */}
            <Button color="inherit">Home</Button>
            <Button color="inherit">About</Button>
            <Button color="inherit">Services</Button>
            {/* ... other navigation items */}
          </Box>
          <Box>
            {/* Connect to wallet button */}
            {walletAddress ? (
              <ConnectButton color="inherit" onClick={disconnectWallet} sx={{backgroundColor: 'crimson'}}>Disconnect</ConnectButton>
            ) : (
              <ConnectButton color="inherit" onClick={connectWallet} sx={{backgroundColor: '#512da8'}}>Connect</ConnectButton>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;