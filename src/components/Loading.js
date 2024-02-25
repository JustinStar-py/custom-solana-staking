import React, { useState, useEffect } from 'react';
import { Snackbar, CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';

const MessageBox = ({ type, message, isLoading, setMessageInfo }) => {
  // State to control the visibility of the Snackbar
  const [open, setOpen] = useState(true);

  // Automatically close the message box for success and error messages after a delay
  useEffect(() => {
    let timer;

    if (type !== 'loading' && !isLoading) {
      timer = setTimeout(() => {
        setOpen(false);
      }, 4000); // 4 seconds delay
    }
    return () => clearTimeout(timer);
  }, [type, isLoading]);

  // Function to close the Snackbar
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={open}
      autoHideDuration={type === 'loading' ? null : 4500}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={type !== 'loading' ? type : 'info'}
        sx={{
          width: 'fit-content',
          borderRadius: '12px',
          fontFamily: 'Newake',
          fontSize: '20px',
          backgroundColor: type === 'loading' ? 'transparent' : undefined,
          boxShadow: type === 'loading' ? 'none' : undefined,
          width: '23vw',
          height: '10vh',
          alignItems: 'center',
          backgroundColor: type === 'loading' ? 'beige' : undefined,
          '& .MuiAlert-message': {
            width: '100%',
          },
          '& .MuiAlert-icon': {
            display: type === 'loading' ? 'none' : 'block',
          },
          '& span': {
            verticalAlign: 'middle',
          },
        }}
      >
        {isLoading ? (
          <>
            {message}
            <CircularProgress color="inherit"  size={23} sx={{ marginLeft: '10px' }} />
        </>
        ) : (
          message
        )}
      </Alert>
    </Snackbar>
  );
};

export default MessageBox;