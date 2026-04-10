"use client";
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const CHART_THEME = {
  accent: '#F5A623',
  bg: 'transparent',
  border: '#1E2128',
  text: '#8B90A0',
  fontFamily: "'IBM Plex Mono', monospace"
};

export const BreakdownBarChart = ({ data }: { data: any }) => {
  // Map our ChartData to Recharts format
  const chartData = data.labels.map((label: string, i: number) => ({
    name: label,
    value: data.values[i],
    isTop: i === 0
  }));

  return (
    <div className="h-[220px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_THEME.border} />
          <XAxis 
            type="number" 
            hide 
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: CHART_THEME.text, fontSize: 10, fontFamily: CHART_THEME.fontFamily }}
            width={80}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(245, 166, 35, 0.05)' }}
            contentStyle={{ 
                backgroundColor: '#181B22', 
                borderColor: '#1E2128',
                fontSize: '11px',
                fontFamily: CHART_THEME.fontFamily,
                borderRadius: '4px',
                color: '#8B90A0'
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.isTop ? CHART_THEME.accent : '#F5A62380'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
