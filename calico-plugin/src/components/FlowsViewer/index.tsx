import { Icon } from '@iconify/react';
import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead, TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { useFlows } from '../../api/queries';
import { FlowLog } from '../../types';

const FlowsViewer = () => {
  const [openRow, setOpenRow] = React.useState<number | null>(null);
  const { flowsData, flowsError, fetchingFlows, refetchFlows } = useFlows();
  console.log(flowsData, flowsError, fetchingFlows);

  // const [loggedIn, setLoggedIn] = React.useState<boolean>(false);
  // const [loggingIn, setLoggingIn] = React.useState<boolean>(false);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'start_time',
        header: 'start_time',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'end_time',
        header: 'end_time',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'action',
        header: 'action',
        cell: info => {
          const value = info.getValue();
          const row = info.row.original;
          const color = value === 'Deny' ? '#f1403e' : value === 'Allow' ? '#33d28d' : '#5F5F5F';
          return (
            <Tooltip
              title={
                <pre style={{ margin: 0 }}>
                  {row.policies?.enforced?.[0]?.name && row.policies.enforced[0].name !== ''
                    ? JSON.stringify(row.policies.enforced[0].name, null, 2)
                    : JSON.stringify('default.deny', null, 2)}
                </pre>
              }
              placement="top"
              arrow
            >
              <Box component="span" display="flex" alignItems="center" gap={1}>
                <Box
                  component="span"
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'inline-block',
                  }}
                />
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: 'source_namespace',
        header: 'source_namespace',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'source_name',
        header: 'source_name',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'dest_namespace',
        header: 'dest_namespace',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'dest_name',
        header: 'dest_name',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'protocol',
        header: 'protocol',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'dest_port',
        header: 'dest_port',
        cell: info => info.getValue(),
      },
    ],
    [flowsData]
  );

  const data = Array.isArray(flowsData)
    ? flowsData
    : flowsData && Array.isArray(flowsData.items)
    ? flowsData.items
    : [];

  const table = useReactTable({
    data: data as FlowLog[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <SectionBox paddingTop={2} marginTop={2}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Box display="flex" alignItems="center" gap={2}>
              <Icon icon="custom:calico" width={32} height={32} />
              <Typography variant="h5" component="h1">
                Calico Flows via Whisker APIs Colm
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={refetchFlows} disabled={fetchingFlows}>
              {fetchingFlows ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              Refresh Flows
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {flowsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Error:</strong> {flowsError}
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

          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell />
                  {table.getHeaderGroups()[0].headers.map(header => (
                    <TableCell key={header.id}>
                      {header.column.columnDef.header as string}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row, idx) => (
                  <React.Fragment key={row.id}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setOpenRow(openRow === idx ? null : idx)}
                        >
                          {openRow === idx ? 'a' : 'b'}
                        </IconButton>
                      </TableCell>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + 1}
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                      >
                        <Collapse in={openRow === idx} timeout="auto" unmountOnExit>
                          <Box margin={1}>{row.original.action}</Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
            {JSON.stringify(flowsData, null, 2)}
          </pre>
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

      {/* <Paper sx={{ p: 3, mb: 3 }}>
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
      {/* </Paper> */} 
    </SectionBox>
  );
};

export default FlowsViewer;
