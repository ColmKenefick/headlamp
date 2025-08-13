import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Custom tooltip as ES6 arrow function
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: '#fff', padding: '8px', border: '1px solid #ccc' }}>
        <strong>{data.policy}</strong>
        <div>Tier: {data.tier}</div>
        <div>Namespace: {data.namespace || '—'}</div>
        <div>Allowed: {data.allowed}</div>
        <div>Denied: {data.denied}</div>
      </div>
    );
  }
  return null;
};

// Main chart component, accepts rawData as a prop
const PolicyChart = ({ rawData }) => {
  const chartData = React.useMemo(
    () =>
      rawData.map(d => ({
        policy: d.policy,
        namespace: d.namespace,
        tier: d.tier,
        allowed: d.allowed ? Number(d.allowed) : 0,
        denied: d.denied ? Number(d.denied) : 0,
      })),
    [rawData]
  );

  return (
    <div style={{ background: '#fff', padding: 16 }}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          valueFormatter={
            /* istanbul ignore next */ (value: number) =>
              Intl.NumberFormat('en', {
                notation: 'compact',
              }).format(Math.abs(+value))
          }
        >
          <CartesianGrid />
          <XAxis dataKey="policy" />
          <YAxis axisLine={false} />
          {/* @ts-ignore */}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="denied" stackId="a" fill="#d9534f" />
          <Bar dataKey="allowed" stackId="a" fill="#5cb85c" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PolicyChart;
