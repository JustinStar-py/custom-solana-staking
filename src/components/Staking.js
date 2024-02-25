import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import * as buffer from 'buffer';
import { PublicKey, Transaction, Connection, SystemProgram } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';
import { SHA256, MD5 } from 'crypto-js';
import { toast } from 'react-hot-toast';

window.Buffer = buffer.Buffer;

const ENDPOINT = "http://localhost:5000"

// Custom Paper component with Uniswap/PancakeSwap styling
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: '0px 2px 1px -1px rgb(255 255 255 / 40%), 0px 1px 14px 0px rgb(255 255 255 / 40%), 0px 1px 3px 0px rgb(255 255 255 / 40%)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0px 2px 1px -1px rgb(255 255 255 / 85%), 0px 1px 14px 0px rgb(255 255 255 / 85%), 0px 1px 10px 0px rgb(255 255 255 / 85%)',
  },
}))

const AppButton = styled(Button)(({ theme }) => ({
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  fontFamily: 'DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif',
  fontSize: '18px',
  fontWeight: '800',
  height: '48px',
  lineHeight: '48px',
  padding: '0 24px',
  borderRadius: '4px',
  textTransform: 'capitalize',
  borderRadius: '10px',
  boxShadow: '-3px 3px 1px rgb(81 45 168 / 13%)',
  transition: 'all 0.3s',
  marginTop:'5px', 
  width: '100%', 
  background: 'linear-gradient(266deg, #1BAECA 0%, #1F3DC9 104.69%)',
  '&:hover': {
    boxShadow: '-2px 2px 1px rgb(81 45 168 / 1%)',
    filter: 'hue-rotate(150deg)',
  }
}));

// styled the li tag in the table
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: 'DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif',
  fontWeight: '400',
  fontSize: '16px',
  '&:hover': {  
    filter: 'grayscale(1)',
  },
}))

const Staking = (props) => {
  // State and logic would be added here
  const { userAddress, walletProvider, connection, messageInfo, setMessageInfo } = props;
  const [amountIn, setAmountIn] = useState(0);
  const [sending, setSending] = useState(false);
  const [stakingData, setStakingData] = useState(null);

  useEffect(() => {
    if (userAddress) {
      axios.get(ENDPOINT + '/user/' + MD5(userAddress.publicKey).toString())
      .then(response => {
          setStakingData(response.data);
          console.log(response.data); // Log the response data
      })
    }
  } , [userAddress, messageInfo]);

  const getProvider = async () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        console.log("Is Phantom installed? ", provider.isPhantom);
        return provider;
      }
    } else {
      window.open("https://www.phantom.app/", "_blank");
    }
  };

  async function transferToken(sender, amount) {
      try {
        // Define the addressesz
        const mintAddress = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS);
        const senderAddress = new PublicKey(sender);
        const recipientAddress = new PublicKey(process.env.REACT_APP_STAKING_RECIPIENT_ADDRESS);

        // Create new token instance
        const token = new Token(connection, mintAddress, TOKEN_PROGRAM_ID, null);
      
        // Get or create associated token accounts
        const senderTokenAccountInfo = await token.getOrCreateAssociatedAccountInfo(senderAddress);
        const recipientTokenAccountInfo = await token.getOrCreateAssociatedAccountInfo(recipientAddress);
      
        // Create transfer instruction
        const instruction = Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderTokenAccountInfo.address,
          recipientTokenAccountInfo.address,
          senderAddress,
          [],
          amount * 10 ** process.env.REACT_APP_TOKEN_DECIMALS
        );
      
        // Create and sign transaction
        const transaction = new Transaction().add(instruction);
        transaction.feePayer = senderAddress;
        const recentBlockhash = await connection.getRecentBlockhash();
        transaction.recentBlockhash = recentBlockhash.blockhash;
      
        // TODO: Sign transaction with sender's wallet
        const signedTransaction = await walletProvider.signTransaction(transaction);
      
        // Send transaction
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());

        return txid;
    } catch (error) {
        console.log(error);
        return false;
   }
}
  
  const handleStake = async () => {
     setMessageInfo({ isLoading: true, messageText: 'Processing stake transaction...', messageType: 'loading'});
     const transactionId = await transferToken(userAddress.publicKey, amountIn);
     const signature = await (await axios.get(ENDPOINT + `/get-signature/${userAddress.publicKey}/${amountIn}`)).data.signature;

     if (transactionId) {
      await axios.post(ENDPOINT + '/stake', {
        singature: signature,
        amount: amountIn,
        userAddress: userAddress.publicKey,
        userId: MD5(userAddress.publicKey).toString(),
        transactionId : transactionId
      })
      .then(response => {
          console.log(response); // Log the response data
          setMessageInfo({ isLoading: false, messageText: 'Transaction successful', messageType: 'success' });
      })
      .catch(error => {
          console.error('There was a problem with the axios request:', error);
          setMessageInfo({ isLoading: false, messageText: 'Transaction failed', messageType: 'error' });
      });
     } else {
        setMessageInfo({ isLoading: false, messageText: 'Transaction failed', messageType: 'error' });
     }

  }

  const handleUnstake = async () => {
    setMessageInfo({ isLoading: true, messageText: 'Processing unstake transaction...', messageType: 'loading'});
    const message = await (await axios.get(ENDPOINT + `/get-signature/${userAddress.publicKey}/${amountIn}`)).data.signature;
    const encodedMessage = new TextEncoder().encode(message);
    let signedMessage = null;

    try {
      signedMessage = await window.solana.request({
        method: 'signMessage',
        params: {
          message: encodedMessage,
          display: 'utf8',
        },
      });
    } catch (error) {
      setMessageInfo({ isLoading: false, messageText: `Error: ${error.message.replace('Error: ', '')}`, messageType: 'error' });
      return false;
    }
    
    // Send the signed message to the backend
    axios.post(ENDPOINT + '/unstake', {
      signature: signedMessage,
      amount: amountIn,
      userAddress: userAddress.publicKey,
      userId: MD5(userAddress.publicKey).toString(),
    }).then(response => {
        setMessageInfo({ isLoading: false, messageText: 'Transaction successful', messageType: 'success' });
    }).catch(error => {
        setMessageInfo({ isLoading: false, messageText: `Error: ${error.message.replace('Error: ', '')}`, messageType: 'error' });
    })
  }

  const handleClaim = async () => {
    setMessageInfo({ isLoading: true, messageText: 'Processing unstake transaction...', messageType: 'loading'});
    const message = await (await axios.get(ENDPOINT + `/get-signature/${userAddress.publicKey}/${amountIn}`)).data.signature;
    const encodedMessage = new TextEncoder().encode(message);
    let signedMessage = null;

    try {
      signedMessage = await window.solana.request({
        method: 'signMessage',
        params: {
          message: encodedMessage,
          display: 'utf8',
        },
      });
    } catch (error) {
      setMessageInfo({ isLoading: false, messageText: `Error: ${error.message.replace('Error: ', '')}`, messageType: 'error' });
      return false;
    }

    // Send the signed message to the backend
    axios.post(ENDPOINT + '/claim', {
      signature: signedMessage,
      amount: amountIn,
      userAddress: userAddress.publicKey,
      userId: MD5(userAddress.publicKey).toString(),
    }).then(response => {
        setMessageInfo({ isLoading: false, messageText: 'Transaction successful', messageType: 'success' });
    }).catch(error => {
        setMessageInfo({ isLoading: false, messageText: 'Transaction failed', messageType: 'error' });
    })
  }

  return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'auto' }}>
        <Grid container spacing={3} justifyContent="center" mb={10} mt={window.innerWidth > 600 ? 0 : 20}>
          <Grid item xs={12} md={6} lg={4} flexBasis={'85%'}>
            <StyledPaper>
              <Typography variant="h4" gutterBottom component="div" fontWeight={'300'} fontFamily="Newake, DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif">
                Staking
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }} fontWeight="medium" fontFamily="Newake, DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif">
                Stake your tokens and earn rewards
              </Typography>
              <TextField fullWidth onChange={(event) => setAmountIn(event.target.value)} label="Amount to Stake" type="number" margin="normal" sx={{ borderRadius: '15px' }} />
              <Box sx={{ justifyContent: 'space-between', mt: 2 }}>
                <AppButton variant="contained" color="primary" onClick={handleStake} disabled={messageInfo.isLoading || !userAddress}>
                  Stake
                </AppButton>
                <AppButton variant="contained" color="secondary" onClick={handleUnstake} disabled={messageInfo.isLoading || !userAddress}>
                  Unstake
                </AppButton>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }} fontWeight="medium" fontFamily="DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif">
                Your Balance: 0.00 
              </Typography>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6} lg={4} flexBasis={'85%'}>
            <StyledPaper>
              <Typography variant="h4" gutterBottom component="div" fontWeight={300} fontFamily={'Newake, DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif'}>
                Staking Info
              </Typography>
              <TableContainer component={Box} >
                <Table aria-label="staking info table">
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell>Asset</StyledTableCell>
                      <StyledTableCell align="right">Staked</StyledTableCell>
                      <StyledTableCell align="right">Rewards</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    <StyledTableRow>
                      <StyledTableCell>$Wagmi</StyledTableCell>
                      <StyledTableCell align="right">{stakingData? parseFloat(stakingData.totalStaked).toFixed(2) : 'loading'}</StyledTableCell>
                      <StyledTableCell align="right">{stakingData? parseFloat(stakingData.claimableTokens).toFixed(2) : 'loading'}</StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
                <AppButton variant="contained" color="secondary" onClick={handleClaim} disabled={messageInfo.isLoading || !userAddress} sx={{ width: '100%', mt: 2, background: 'linear-gradient(266deg, #00c2da 0%, #00ff43 104.69%)', }}>
                    Claim Rewards
                </AppButton>
              </TableContainer>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
  );
};

export default Staking;
