import React from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// Custom Paper component with Uniswap/PancakeSwap styling
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: '0px 2px 1px -1px rgb(255 255 255 / 60%), 0px 1px 14px 0px rgb(255 255 255 / 60%), 0px 1px 3px 0px rgb(255 255 255 / 60%)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0px 2px 1px -1px rgb(255 255 255 / 85%), 0px 1px 14px 0px rgb(255 255 255 / 85%), 0px 1px 3px 0px rgb(255 255 255 / 85%)',
  },
}))

const AppButton = styled(Button)(({ theme }) => ({
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  fontFamily: 'DM Sans, Roboto, Helvetica Neue, Helvetica, Arial, sans-serif',
  fontSize: '16px',
  fontWeight: '800',
  height: '48px',
  lineHeight: '48px',
  padding: '0 24px',
  borderRadius: '4px',
  textTransform: 'Uppercase',
  borderRadius: '10px',
  boxShadow: '-3px 3px 1px rgb(81 45 168 / 13%)',
  '&:hover': {
    boxShadow: '-2px 2px 1px rgb(81 45 168 / 1%)',
    filter: 'grayscale(1)',
  },
}));

const Staking = () => {
  // State and logic would be added here

  return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Grid container spacing={3} justifyContent="center" mb={10}>
          <Grid item xs={12} md={6} lg={4}>
            <StyledPaper>
              <Typography variant="h4" gutterBottom component="div">
                Staking
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Stake your tokens and earn rewards
              </Typography>
              <TextField fullWidth label="Amount to Stake" type="number" margin="normal" sx={{ borderRadius: '15px' }} />
              <Box sx={{ justifyContent: 'space-between', mt: 2 }}>
                <AppButton variant="contained" color="primary" sx={{mt:'5px', width: '100%', background: 'linear-gradient(45deg, #00ff96, #7919ff)'}}>
                  Stake
                </AppButton>
                <AppButton variant="contained" color="secondary" sx={{mt:'5px', width: '100%', background: '#512da8'}}>
                  Unstake
                </AppButton>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Your Balance: 0.00 
              </Typography>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <StyledPaper>
              <Typography variant="h4" gutterBottom component="div">
                Staking Info
              </Typography>
              <TableContainer component={Box}>
                <Table aria-label="staking info table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset</TableCell>
                      <TableCell align="right">Staked</TableCell>
                      <TableCell align="right">Rewards</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Iterate over staking info and populate the table rows */}
                    {/* This is placeholder content */}
                    <TableRow>
                      <TableCell>Coinname</TableCell>
                      <TableCell align="right">1000 Coin</TableCell>
                      <TableCell align="right">50 Coin</TableCell>
                    </TableRow>
                    {/* ...more rows */}
                  </TableBody>
                </Table>
              </TableContainer>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
  );
};

export default Staking;