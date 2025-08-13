import {
    Box,
    Button,
    Grid,
    TextField
} from '@mui/material';
import React from 'react';

const CalicoCloudLogin = () => {

  const [loggedIn, setLoggedIn] = React.useState<boolean>(false);
  const [loggingIn, setLoggingIn] = React.useState<boolean>(false);

  return (
   
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <TextField id="standard-basic" label="Email" variant="standard" />
              <TextField id="standard-basic" label="Password" variant="standard" />
              <Button variant="contained" onClick={() => {
                  console.log('Logging in...');
                  setTimeout(() => {
                    setLoggedIn(true);
                    console.log('Logged in successfully');
                  }, 2000);
                }} loading={loggingIn.toString()} disabled={loggedIn}>{loggedIn ? 'All set!' : 'Log In'}</Button>
            </Box>
          </Grid>
        </Grid>
  );
};

export default CalicoCloudLogin;
