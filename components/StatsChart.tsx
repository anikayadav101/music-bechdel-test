'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DecadeData {
  decade: string;
  pass: number;
  fail: number;
  partial: number;
}

interface StatsChartProps {
  data: DecadeData[];
}

export default function StatsChart({ data }: StatsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="metal-card p-6 text-center text-gray-500">
        No data available yet. Analyze some songs to see statistics!
      </div>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    passPercentage: item.pass + item.partial + item.fail > 0
      ? Math.round((item.pass / (item.pass + item.fail + item.partial)) * 100)
      : 0
  }));

  return (
    <div className="metal-card p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Pass Rate by Decade
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="decade" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pass" fill="#10b981" name="Pass" />
          <Bar dataKey="partial" fill="#f59e0b" name="Partial" />
          <Bar dataKey="fail" fill="#ef4444" name="Fail" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

