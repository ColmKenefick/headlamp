
import {
  Box,
  Grid,
  Icon,
  Link,
  Paper,
  Typography
} from '@mui/material';
// import { Auth0LoginComponent } from '../auth0-login';
import { useEffect, useState } from 'react';
import { useStats } from '../../api/queries';
import Auth0Client from '../../utils/auth0-client';
import CalicoCloudLogin from '../CalicoCloudLogin';
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
  const email = 'antony+hackathon2025@tigera.io';
  const password = 'SGbAspBLAXq7cCf';

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

  useEffect(() => {
    authClient
      .login(email, password)
      .then(data => {
        // https://p95znudz-multi-09-management.dev.calicocloud.io/tigera-elasticsearch/flows/statistics?type=PacketCount&groupBy=Policy&startTimeGt=-900&startTimeLt=-0
        const tenantID = data?.decodedToken['https://calicocloud.io/tenantID'];
        console.log('Login successful', data, tenantID);
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
  }, []);

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
                  No Calico Cloud account? <Link href="https://www.dev.calicocloud.io/" target="_blank">Get one for free!</Link>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <p>This functionality requires you to log in to Calico Cloud.</p>
          <p>This will give you access to its pwerful API for improved Observability.</p>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <CalicoCloudLogin /> 
              </Box>
            </Grid>
          </Paper>

      <pre
        style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '600px',
          fontSize: '12px',
          border: '1px solid #ddd',
        }}
      >
        {statsData && !fetchingStats ? (
          <>
            {' '}
            {
              <PolicyChart rawData={statsData} />
              // JSON.stringify(statsData, null, 2)
            }
          </>
        ) : (
          'No stats data available'
        )}
      </pre>
    </Box>
  );
};

export default CalicoCloudToken;
