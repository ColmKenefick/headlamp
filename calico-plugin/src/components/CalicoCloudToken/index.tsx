import { Box, Button, Grid, Link, Paper, TextField, Typography } from '@mui/material';
// import { Auth0LoginComponent } from '../auth0-login';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { useStats } from '../../api/queries';
import Auth0Client from '../../utils/auth0-client';
import PolicyChart from '../PacketsByPolicy';

// Configuration
const AUTH_CONFIG = {
  tokenUrl: 'https://auth.dev.calicocloud.io/oauth/token',
  clientId: 'OA3MPiof9wwX72xpyQ8IgyEfOe1qNUDg',
  audience: 'default',
  scope: 'openid profile email offline_access',

  // Token refresh settings
  refreshBufferMinutes: 5,
  maxRetries: 3,
  retryDelayMs: 5000,
};

const authClient = new Auth0Client(AUTH_CONFIG);
const CalicoCloudToken = () => {
  const email = 'colm.kenefick+00free44@tigera.io';
  const password = '3k#2PAUs%A3UVS';

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  const [token, setToken] = useState(null);

  const [data, setData] = useState('Nothing yet');

  authClient.setCallbacks({
    onTokenUpdate: () => {
      console.log('Token updated:', authClient.getCurrentToken());
      setToken(authClient.getCurrentToken());
    },
  });

  const { statsData, statsError, fetchingStats, refetchStats } = useStats(token);
  console.log(statsData, statsError, fetchingStats);

  // useEffect(() => {
  //   authClient
  //     .login(email, password)
  //     .then(data => {
  //       // https://p95znudz-multi-09-management.dev.calicocloud.io/tigera-elasticsearch/flows/statistics?type=PacketCount&groupBy=Policy&startTimeGt=-900&startTimeLt=-0
  //       const tenantID = data?.decodedToken['https://calicocloud.io/tenantID'];
  //       console.log('Login successful', data, tenantID);
  //     })
  //     .catch(error => {
  //       console.error('Login failed:', error);
  //     });
  // }, []);

  useEffect(() => {
    if (token) {
      setData('Fake data...');
      refetchStats();
    }
  }, [token]);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Box display="flex" alignItems="center" gap={2}>
              <Icon icon="custom:calico" width={32} height={32} />
              <Typography variant="h5" component="h1">
                Calico Cloud Observability
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Typography variant="body1">
              No Calico Cloud account?{' '}
              <Link href="https://www.dev.calicocloud.io/" target="_blank">
                Get one for free!
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <p>This functionality requires you to log in to Calico Cloud.</p>
      <p>This will give you access to its pwerful API for improved Observability <i>(for the demo, use {email} and {password})</i>.</p>
      <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                {/* <CalicoCloudLogin />  */}
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TextField id="standard-basic" label="Email" variant="standard" />
                      <TextField id="standard-basic" label="Password" variant="standard" />
                      <Button variant="contained" onClick={() => {
                          console.log('...');

                          authClient.login(email, password)
                          .then(data => {
                            // https://p95znudz-multi-09-management.dev.calicocloud.io/tigera-elasticsearch/flows/statistics?type=PacketCount&groupBy=Policy&startTimeGt=-900&startTimeLt=-0
                            const tenantID = data?.decodedToken['https://calicocloud.io/tenantID'];
                            setLoggedIn(true);
                            console.log('Login successful', data, tenantID);
                          })
                          .catch(error => {
                            console.error('Login failed:', error);
                          });

                          // setTimeout(() => {

                          //   setLoggedIn(true);
                          //   console.log('Logged in successfully');
                          // }, 2000);
                        }} loading={loggingIn} disabled={loggedIn}>{loggedIn ? 'All set!' : 'Log In'}</Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Paper>
    
      {loggedIn && statsData && statsData.length > 0 && !fetchingStats && (
        <>
          <Box display="flex" alignItems="center" gap={2} marginTop={4}>
            <Icon icon="custom:calico" width={64} height={64} />
            <Typography variant="h5" component="h1">
              This chart shows the Packets By Policy in your Cluster over the last 15 minutes.
            </Typography>
          </Box>
          <PolicyChart rawData={statsData} />
        </>
      // ) : statsError === null ? (
      //   <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
      //     <CircularProgress />
      //   </Box>
      // ) : (
      //   'No stats data available'
      )}
    </Box>
  );
};

export default CalicoCloudToken;
