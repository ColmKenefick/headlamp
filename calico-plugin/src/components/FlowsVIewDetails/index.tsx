import React, { useMemo } from 'react';
import { Table, Box, Paper, TableContainer } from '@mui/material';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { TableCell } from '@mui/material';
import { TableHead, TableRow } from '@mui/material';
import { TableBody } from '@mui/material';
import { Collapse } from '@mui/material';
import { FlowLog } from '../../types';
import { Button } from '@mui/material';
import { Icon } from '@iconify/react';
import { getTableColumns } from './flowViewTable';

export const FlowsViewDetails = ({ flowsData }) => {
  const [openRow, setOpenRow] = React.useState<number | null>(null);

  const columns = useMemo(() => getTableColumns(), [flowsData]);

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
    <TableContainer component={Paper} sx={{ maxHeight: 800 }}>
      <Table stickyHeader>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              <TableCell sx={{ backgroundColor: 'rgb(245, 245, 245)' }} />{' '}
              {/* empty cell for your expand/collapse button column */}
              {headerGroup.headers.map(header => (
                <TableCell
                  key={header.id}
                  sx={{ backgroundColor: 'rgb(245, 245, 245)', fontWeight: 700 }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row, idx) => (
            <React.Fragment key={row.id}>
              <TableRow>
                <TableCell>
                  <Button size="small" onClick={() => setOpenRow(openRow === idx ? null : idx)}>
                    {openRow === idx ? (
                      <Icon icon="mdi:chevron-up" width={32} height={32} />
                    ) : (
                      <Icon icon="mdi:chevron-down" width={32} height={32} />
                    )}
                  </Button>
                </TableCell>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell colSpan={columns.length + 1} style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={openRow === idx} timeout="auto" unmountOnExit>
                    <Box margin={1}>
                      <Paper
                        sx={{ p: 2, background: '#f5f5f5', borderRadius: 2, overflow: 'auto' }}
                      >
                        <pre style={{ margin: 0, fontSize: 14 }}>
                          {JSON.stringify(row.original, null, 2)}
                        </pre>
                      </Paper>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
