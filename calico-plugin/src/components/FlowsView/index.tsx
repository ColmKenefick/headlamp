import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Button, CircularProgress, Alert, Box, Grid, Paper, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useFlows } from '../../api/queries';
import { LinearProgress } from '@mui/material';
import { FlowsViewDetails } from '../FlowsVIewDetails';

const FlowsView = () => {
  const { flowsData, flowsError, fetchingFlows, refetchFlows } = useFlows();
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
          <Typography variant="h6" gutterBottom>
            Flow Data:
          </Typography>
          <FlowsViewDetails flowsData={flowsData} />
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
    </SectionBox>
  );
};

export default FlowsView;
