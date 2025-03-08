
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BurndownData } from '@/types';

interface BurndownChartProps {
  data: BurndownData[];
  title: string;
  subtitle: string;
}

const BurndownChart: React.FC<BurndownChartProps> = ({ data, title, subtitle }) => {
  // Format date for X-axis
  const formatXAxis = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Card className="w-full bg-black border border-gray-800 rounded-lg overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white">{title}</CardTitle>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#888' }} 
                tickFormatter={formatXAxis}
                stroke="#444" 
              />
              <YAxis 
                label={{ 
                  value: 'Story Points', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#888' }
                }} 
                tick={{ fill: '#888' }}
                stroke="#444"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#222', 
                  border: '1px solid #444',
                  color: '#eee' 
                }}
              />
              <Legend wrapperStyle={{ color: '#eee' }} />
              <Line 
                type="monotone" 
                dataKey="ideal" 
                name="Ideal Burndown"
                stroke="#8884d8" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Burndown"
                stroke="#4ade80" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BurndownChart;
