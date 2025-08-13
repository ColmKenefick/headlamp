import { Icon } from '@iconify/react';
import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Alert, Box, Button, CircularProgress, Grid, LinearProgress, Link, Paper, Typography } from '@mui/material';
import { useFlows } from '../../api/queries';
import CalicoCloudLogin from '../CalicoCloudLogin';
import { FlowsViewDetails } from '../FlowsVIewDetails';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useMemo, useState } from 'react';

const FlowsView = () => {
  const { flowsData, flowsError, fetchingFlows, refetchFlows } = useFlows();

  const [selectedNamespace, setSelectedNamespace] = useState('');
  const namespaces = useMemo(
    () => Array.from(new Set(flowsData?.items.map(row => row.source_namespace))).filter(Boolean),
    [flowsData]
  );

  const filteredData = selectedNamespace
    ? flowsData?.items.filter(row => row.source_namespace === selectedNamespace)
    : flowsData?.items;

  console.log(filteredData, namespaces);

  return (
    <SectionBox paddingTop={2} marginTop={2}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          container
          spacing={2}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Icon icon="custom:calico" width={32} height={32} />
            <Typography variant="h5" component="h1">
              Calico Flows via Whisker APIs
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => refetchFlows()}
            disabled={fetchingFlows}
            sx={{ lineHeight: 1.5 }}
          >
            {fetchingFlows ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Refresh Flows
          </Button>
        </Box>
      </Paper>

      {flowsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Error:</strong>{' '}
          {flowsError instanceof Error ? flowsError.message : String(flowsError)}
          <br />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Make sure Whisker is running and accessible. You may need to port-forward:
            <br />
            <code>kubectl port-forward -n calico-system svc/calico-whisker 3002:8080</code>
          </Typography>
        </Alert>
      )}

      {fetchingFlows && <LinearProgress sx={{ mb: 2 }} />}

      {flowsData && !fetchingFlows && (
        <Box>
          <FormControl sx={{ minWidth: 200, mb: 2 }}>
            <InputLabel id="namespace-select-label">Namespace</InputLabel>
            <Select
              labelId="namespace-select-label"
              value={selectedNamespace}
              label="Namespace"
              onChange={e => setSelectedNamespace(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {namespaces.map(ns => (
                <MenuItem key={ns} value={ns}>
                  {ns}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" gutterBottom>
            Flow Data:
          </Typography>
          <FlowsViewDetails flowsData={filteredData} />
        </Box>
      )}

      {!flowsData && !fetchingFlows && !flowsError && (
        <Alert severity="info">
          <strong>Getting Started:</strong>
          <br />
          1. Ensure Calico and Whisker are deployed in your cluster
          <br />
          2. Port-forward the Whisker service:
          <br />
          <code>kubectl port-forward -n calico-system svc/calico-whisker 3002:8080</code>
          <br />
          3. Click "Refresh Flows" to retrieve flow data
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Icon icon="custom:calico" width={32} height={32} />
                    <Typography variant="h5" component="h1">
                      More insights with Calico Cloud
                    </Typography>
                    <Typography variant="body1">
                      No Calico Cloud account? <Link href="https://www.dev.calicocloud.io/" target="_blank">Get one for free!</Link>
                    </Typography>
        
                  </Box>
                </Grid>
              </Grid>
              <CalicoCloudLogin />
              {/* <Grid container spacing={2} alignItems="center" justifyContent="space-between">
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
              </Grid> */}
            </Paper>
    </SectionBox>
  );
};

export default FlowsView;
