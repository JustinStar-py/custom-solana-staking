import React from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// Custom Paper component with Uniswap/PancakeSwap styling
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: '-8px 9px 1px rgb(0 10 255 / 50%)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '-2px 2px 1px rgba(0, 0, 0, 0.3)',
  },
}))


const Staking = () => {
  // State and logic would be added here

  return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={6} lg={4}>
            <StyledPaper>
              <Typography variant="h4" gutterBottom component="div">
                Staking
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Stake your tokens and earn rewards
              </Typography>
              <TextField fullWidth label="Amount to Stake" type="number" margin="normal" />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="contained" color="primary">
                  Stake
                </Button>
                <Button variant="contained" color="secondary">
                  Unstake
                </Button>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Your Balance: 0.00 SD
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
                      <TableCell>SeaDoge</TableCell>
                      <TableCell align="right">1000 SD</TableCell>
                      <TableCell align="right">50 SD</TableCell>
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