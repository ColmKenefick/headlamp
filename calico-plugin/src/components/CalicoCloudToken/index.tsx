import {
  Box
} from '@mui/material';
// import { Auth0LoginComponent } from '../auth0-login';
import { useEffect, useState } from 'react';
import Auth0Client from '../../utils/auth0-client.js';

// Configuration
const AUTH_CONFIG = {
    // tokenUrl: 'http://127.0.0.1:5555/oauth/token',
    tokenUrl: 'https://auth.dev.calicocloud.io/oauth/token',
    clientId: 'OA3MPiof9wwX72xpyQ8IgyEfOe1qNUDg',
    audience: 'default',
    scope: 'openid profile email offline_access',
    
    // // Hardcoded test credentials
    // username: 'antony+hackathon2025@tigera.io',
    // password: 'SGbAspBLAXq7cCf',
    
    // Token refresh settings
    refreshBufferMinutes: 5,
    maxRetries: 3,
    retryDelayMs: 5000
};

const authClient = new Auth0Client(AUTH_CONFIG);
const CalicoCloudToken = () => {

  const email = "antony+hackathon2025@tigera.io";
  const password = "SGbAspBLAXq7cCf";
  
  const [token, setToken] = useState(null);

  authClient.setCallbacks({ onTokenUpdate: () => {
    console.log('Token updated:', authClient.getCurrentToken());
    setToken(authClient.getCurrentToken());
  } });

  useEffect(() => {
    authClient.login(email, password)
      .catch(error => {
        console.error('Login failed:', error);
      });
  }, []);
  

  return (
        <Box>
          
          <h2>Calico Cloud Token</h2>
          <p>This component demonstrates how to use the Auth0LoginComponent to authenticate with Calico Cloud.</p>    
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
        </Box>
  );
};

export default CalicoCloudToken;
