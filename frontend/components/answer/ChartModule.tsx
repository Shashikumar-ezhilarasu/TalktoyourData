"use client";
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartModuleProps {
  type: 'bar' | 'line' | 'pie' | 'comparison';
  data: {
    labels: string[];
    values: number[];
  };
}

const COLORS = ['#18181B', '#3F3F46', '#71717A', '#A1A1AA', '#D4D4D8'];

export const ChartModule: React.FC<ChartModuleProps> = ({ type, data }) => {
  const chartData = data.labels.map((l, i) => ({
    name: l,
    value: data.values[i]
  }));

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-bg-border p-3 shadow-xl rounded-sm">
          <p className="mono text-[9px] uppercase font-bold text-text-tertiary mb-1">{payload[0].payload.name}</p>
          <p className="text-sm font-black italic text-accent-main">{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        {type === 'pie' ? (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
          </PieChart>
        ) : type === 'line' || type === 'comparison' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18181B" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#18181B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#A1A1AA', fontSize: 9 }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A1A1AA', fontSize: 9 }}
                tickFormatter={(val) => val > 1000 ? `${(val/1000).toFixed(1)}k` : val}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: '#E4E4E7' }} />
            <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#18181B" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorVal)" 
                animationDuration={2000}
            />
          </AreaChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#A1A1AA', fontSize: 9 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#A1A1AA', fontSize: 9 }}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: '#F4F4F5' }} />
            <Bar 
                dataKey="value" 
                fill="#18181B" 
                radius={[2, 2, 0, 0]} 
                barSize={32}
                animationDuration={1500}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};
