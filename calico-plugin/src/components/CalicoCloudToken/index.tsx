import { Box, CircularProgress, Typography } from '@mui/material';
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
      <h2>Calico Cloud Token</h2>
      <p>
        This component demonstrates how to use the Auth0LoginComponent to authenticate with Calico
        Cloud.
      </p>
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
        {token || 'No token available'}
      </pre>

      {statsData && statsData.length > 0 && !fetchingStats ? (
        <>
          <Box display="flex" alignItems="center" gap={2} marginTop={4}>
            <Icon icon="custom:calico" width={64} height={64} />
            <Typography variant="h5" component="h1">
              This chart shows the Packets By Policy in your Cluster over the last 15 minutes.
            </Typography>
          </Box>
          <PolicyChart rawData={statsData} />
        </>
      ) : statsError === null ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
          <CircularProgress />
        </Box>
      ) : (
        'No stats data available'
      )}
    </Box>
  );
};

export default CalicoCloudToken;
