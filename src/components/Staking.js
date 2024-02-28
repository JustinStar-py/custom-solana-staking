import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, 
  TextField, Button, Grid, Table, 
  TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Dialog, DialogActions,
  MenuItem, InputLabel, Select, Divider, Chip  } from '@mui/material';
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
  const [stakingData, setStakingData] = useState(null);
  const [stakePool, setStakePool] = useState(1);
  const [stakingPoolData, setStakingPoolData] = useState(null);
  const [stakingDuration, setStakingDuration] = useState(0);
  const [poolsInfo, setPoolsInfo] = useState(null);

  useEffect(() => {
    if (userAddress) {
      axios.get(ENDPOINT + '/user/' + MD5(userAddress.publicKey).toString())
      .then(response => {
          setStakingData(response.data);
          console.log(response.data); // Log the response data
      })
    }
  } , [userAddress, messageInfo]);

  useEffect(() => {
    if (stakingData && stakingData.totalStaked > 0) {
      axios.get(ENDPOINT + '/get-pool/' + MD5(userAddress.publicKey).toString())
      .then(response => {
          setStakingPoolData(response.data);
      })
    }
  } , [stakingData]);

  useEffect(() => {
    if (stakingData) {
       const interval = setInterval(() => {
        setStakingDuration(convertSecondsToTime((stakingData.stakingStartDate + 86400000 * stakingPoolData.lockDuration - Date.now()) / 1000));
      }, 1000);
  
      return () => clearInterval(interval);
    }
  }, [stakingPoolData]);

  useEffect(() => {
    if (stakePool) {
      axios.get(ENDPOINT + '/get-pools/')
      .then(response => {
          setPoolsInfo(response.data);
      })
    }
  }, [stakePool])

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
      setTimeout(async () => { await axios.post(ENDPOINT + '/stake', {
          singature: signature,
          amount: amountIn,
          userAddress: userAddress.publicKey,
          userId: MD5(userAddress.publicKey).toString(),
          transactionId : transactionId
        })
        .then(response => {
            setMessageInfo({ isLoading: false, messageText: 'Transaction successful', messageType: 'success' });
            setAmountIn(0);
        })
        .catch(error => {
            const messageError = error.response.data.error || error.message.replace('Error: ', '') || 'Transaction failed';
            setMessageInfo({ isLoading: false, messageText: `Error: ${messageError}`, messageType: 'error' });
        }); 
     }, 1500);
     } else {
        setMessageInfo({ isLoading: false, messageText: 'Transaction failed', messageType: 'error' });
     }

  }

  const handleUnstake = async () => {
    setMessageInfo({ isLoading: true, messageText: 'Processing transaction...', messageType: 'loading'});
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
        setAmountIn(0);
    }).catch(error => {
        const messageError = error.response.data.error || error.message.replace('Error: ', '') || 'Transaction failed';
        setMessageInfo({ isLoading: false, messageText: `Error: ${messageError}`, messageType: 'error' });
    }).finally(() => {
        setAmountIn(0);
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
       const messageError = error.response.data.error || error.message.replace('Error: ', '') || 'Transaction failed';
       setMessageInfo({ isLoading: false, messageText: `Error: ${messageError}`, messageType: 'error' });
    })
  }

  const showPoolInfo = (poolId) => {
     setMessageInfo({ isLoading: false, messageText: `APY : ${poolsInfo.pools[poolId].apy}% and Token Lock Duration : ${poolsInfo.pools[poolId].lockDuration} Days`, messageType: 'info', boxType: 'info' });
     setStakePool(poolId);
  }
  
  const convertSecondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = parseInt(seconds % 60);

    if (hours === 0) {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    if (hours === 0 && minutes === 0) {
      return `${remainingSeconds.toString().padStart(2, '0')}`;
    }

    if (hours < 0 || minutes < 0 || remainingSeconds < 0) {
      return 'unlocked 🔓';
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'auto' }}>
        <Grid container spacing={3} justifyContent="center" mb={10} mt={window.innerWidth > 600 ? 0 : 20}>
          <Grid item xs={12} md={6} lg={4} flexBasis={'85%'}>
            <StyledPaper>
              <Typography variant="h4" gutterBottom component="div" fontWeight={'300'} fontFamily="Newake, DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif">
                Staking
              </Typography>
              <TextField fullWidth onChange={(event) => setAmountIn(event.target.value)} label="Amount to Stake" type="number" margin="normal" sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: '12px' }}} />
               {/* show an selecter for choose stake pool */}
               <Box sx={{ justifyContent: 'space-between' }}>
                 <Select
                   labelId="demo-simple-select-label"
                   id="demo-simple-select"
                   value={stakePool}
                   label="Pool"
                   onChange={(event) => showPoolInfo(event.target.value)}
                   disabled={messageInfo.isLoading || !userAddress || !amountIn}
                   sx={{width:'100%', fontFamily: 'DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: '800',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '12px'
                      }
                  }}
                 >
                   <MenuItem value={1}>Pool 1</MenuItem>
                   <MenuItem value={2}>Pool 2</MenuItem>
                   <MenuItem value={3}>Pool 3</MenuItem>
                 </Select>
             </Box>
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
              </TableContainer>
              {/* write an line here */}
              <Divider sx={{ my: 1 }}>
                <Chip label="Pool Info" size="small" sx={{ color: '#fff', background: 'linear-gradient(266deg, #1BAECA 0%, #1F3DC9 104.69%)' }} />
              </Divider>
              <TableContainer component={Box} sx={{ mt: 1 }}>
                <Table aria-label="staking info table">
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell>Pool ID</StyledTableCell>
                      <StyledTableCell align="right">APY</StyledTableCell>
                      <StyledTableCell align="right">Lock Duration</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    <StyledTableRow>
                      <StyledTableCell>{stakingPoolData? stakingPoolData.Id : 0}</StyledTableCell>
                      <StyledTableCell align="right">{stakingPoolData? stakingPoolData.apy : 0}%</StyledTableCell>
                      <StyledTableCell align="right">{stakingPoolData?  stakingDuration : '00:00'}</StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
                 {stakingData && stakingData.claimableTokens >= 10 &&
                   <AppButton variant="contained" color="secondary" onClick={handleClaim} disabled={messageInfo.isLoading || !userAddress} sx={{ width: '100%', mt: 2, background: 'linear-gradient(266deg, #00c2da 0%, #00ff43 104.69%)', }}>
                     Claim Rewards
                   </AppButton>
                 }
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
  );
};

export default Staking;
