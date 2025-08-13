import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// Formats an ISO string to 'YYYY-MM-DD HH:mm:ss'
export function formatIsoDateTime(isoString) {
  if (!isoString) return '';
  const pad = n => n.toString().padStart(2, '0');
  const date = new Date(isoString);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export const getTableColumns = () => [
  {
    accessorKey: 'start_time',
    header: 'start_time',
    cell: info => <>{formatIsoDateTime(info.getValue())}</>,
  },
  {
    accessorKey: 'end_time',
    header: 'end_time',
    cell: info => <>{formatIsoDateTime(info.getValue())}</>,
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
            <Box>
              {row.policies?.enforced?.[0]?.name && row.policies.enforced[0].name !== ''
                ? JSON.stringify(row.policies.enforced[0].name, null, 2)
                : JSON.stringify('default.deny', null, 2)}
            </Box>
          }
          placement="top"
          arrow
          sx={{ fontSize: '0.875rem' }}
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
];
