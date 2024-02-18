import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Box, Button } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, SystemProgram, clusterApiUrl, Keypair } from '@solana/web3.js';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

// styled button
const ConnectButton = styled(Button)(({ theme }) => ({
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    height: '48px',
    lineHeight: '48px',
    padding: '0 24px',
    borderRadius: '4px',
    textTransform: 'Uppercase',
    borderRadius: '10px',
    boxShadow: '-3px 3px 1px rgb(81 45 168 / 13%)',
    fontWeight: '800',
    '&:hover': {
      boxShadow: '-2px 2px 1px rgb(81 45 168 / 1%)',
    },
}));

// styled li buttons
const StyledListButton = styled(Button)(({ theme }) => ({
   fontSize: '17px',
   height: '48px',
   lineHeight: '48px',
   padding: '0 20px',
   borderRadius: '10px',
   textTransform: 'capitalize',
   fontWeight: '500',
   fontFamily: 'DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif',
   transition: 'all .2s ease-in-out',
   '&:hover': {
      fontSize: '20px',
      fontWeight: '700',
   }
}));

const Header = (props) => {
  const { walletAddress, setWalletAddress, setConnection, setWalletProvider } = props;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const connectWallet = async () => {
     // Initialize connection to Solana network
     const solanaConnection = new Connection("https://api.testnet.solana.com");
     setConnection(solanaConnection);
 
     // Initialize wallet provider (e.g., Phantom)
     const provider = window.solana;
     if (provider) {
       setWalletProvider(provider);
       const address = await provider.connect();
       setWalletAddress(address);
     } else {
       console.log("Please install a Solana wallet extension like Phantom.");
     }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {['Home', 'About', 'Services'].map((text) => (
          <ListItem button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );


  return (
     <AppBar position="static" elevation={1} sx={{ background: 'transparent', color: 'white', mt: `${window.innerWidth > 600 ? 10 : 15}px` }}>
      <Toolbar>
       <Box display="flex" width="100%" justifyContent="space-between" alignItems="center" sx={{background: 'linear-gradient(317deg, transparent -4%, #a757ff 1%, #a149ff 2%, transparent 89%)', borderRadius: '10px', padding: '10px' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            {list()}
          </Drawer>
          <Typography variant="h6" sx={{display: { xs: 'none', sm: 'block' } }}>
             Wagmi Staking
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <StyledListButton color="inherit">Home</StyledListButton>
            <StyledListButton color="inherit">About</StyledListButton>
            <StyledListButton color="inherit">Services</StyledListButton>
          </Box>
          {/* Connect to wallet button */}
          {walletAddress ? (
            <ConnectButton color="inherit" onClick={disconnectWallet} sx={{ backgroundColor: 'crimson' }}>Disconnect</ConnectButton>
          ) : (
            <ConnectButton color="inherit" onClick={connectWallet} sx={{ background: '#00ff79' }}>Connect</ConnectButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;