"use client";
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';

interface ChartModuleProps {
  type: 'bar' | 'line' | 'pie' | 'comparison';
  data: {
    labels: string[];
    values: number[];
  };
}

const COLORS = ['#F5A623', '#D48806', '#9E6604', '#754B03', '#F8C063'];

export const ChartModule: React.FC<ChartModuleProps> = ({ type, data }) => {
  const chartData = data.labels.map((l, i) => ({
    name: l,
    value: data.values[i]
  }));

  if (type === 'pie') {
    return (
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F1F', borderRadius: '4px' }}
              itemStyle={{ color: '#F5A623', fontSize: '10px', textTransform: 'uppercase' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'line' || type === 'comparison') {
    return (
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#434343', fontSize: 9 }}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#434343', fontSize: 9 }}
                tickFormatter={(val) => val > 1000 ? `${(val/1000).toFixed(1)}k` : val}
            />
            <Tooltip 
              cursor={{ stroke: '#F5A623', strokeWidth: 1 }}
              contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F1F' }}
              itemStyle={{ color: '#F5A623', fontSize: 10 }}
            />
            <Area type="monotone" dataKey="value" stroke="#F5A623" fillOpacity={1} fill="url(#colorVal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F1F1F" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#434343', fontSize: 9 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#434343', fontSize: 9 }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(245, 166, 35, 0.05)' }}
            contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F1F' }}
            itemStyle={{ color: '#F5A623', fontSize: 10 }}
          />
          <Bar dataKey="value" fill="#F5A623" radius={[2, 2, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
