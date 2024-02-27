import React, { useState, useEffect } from 'react';
import { Snackbar, CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';

const MessageBox = ({ messageInfo, setMessageInfo }) => {
  // State to control the visibility of the Snackbar
  const [open, setOpen] = useState(true);

  // Automatically close the message box for success and error messages after a delay
  useEffect(() => {
    let timer;

    if (messageInfo.messageType !== 'loading' && !messageInfo.isLoading) {
      timer = setTimeout(() => {
        setMessageInfo({ ...messageInfo, messageType: null, boxType: 'transaction' });
      }, 4000); // 4 seconds delay
    }
    return () => clearTimeout(timer);
  }, [messageInfo.messageType, messageInfo.isLoading]);

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
      autoHideDuration={messageInfo.boxType === 'info' ? 5000 : messageInfo.messageType === 'loading' ? null : 3500}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={messageInfo.messageType !== 'loading' ? messageInfo.messageType : 'info'}
        sx={{
          width: 'fit-content',
          borderRadius: '12px',
          fontFamily: 'Newake',
          fontSize: messageInfo.boxType === 'info' ? '15px' : '19px',
          backgroundColor: messageInfo.messageType === 'loading' ? 'transparent' : undefined,
          boxShadow: messageInfo.messageType === 'loading' ? 'none' : undefined,
          width: '23vw',
          height: '10vh',
          alignItems: 'center',
          backgroundColor: messageInfo.messageType === 'loading' ? 'beige' : undefined,
          '& .MuiAlert-message': {
            width: '100%',
          },
          '& .MuiAlert-icon': {
            display: messageInfo.messageType === 'loading' ? 'none' : 'block',
          },
          '& span': {
            verticalAlign: 'middle',
          },
        }}
      >
        {messageInfo.isLoading ? (
          <>
            {messageInfo.messageText}
            <CircularProgress color="inherit"  size={23} sx={{ marginLeft: '10px' }} />
        </>
        ) : (
          messageInfo.messageText
        )}
      </Alert>
    </Snackbar>
  );
};

export default MessageBox;