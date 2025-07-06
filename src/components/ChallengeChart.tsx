
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressSnapshot {
  date: string;
  questions_solved: number;
}

interface ChallengeChartProps {
  data: ProgressSnapshot[];
  targetCount: number;
  title?: string;
}

export const ChallengeChart: React.FC<ChallengeChartProps> = ({ 
  data, 
  targetCount, 
  title = "Progress Over Time" 
}) => {
  // Calculate cumulative progress
  const chartData = data.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    solved: item.questions_solved,
    target: Math.floor((targetCount / data.length) * (index + 1)), // Linear target progression
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: '8px',
          padding: '12px',
          color: '#FFFFFF'
        }}>
          <p style={{ marginBottom: '4px' }}>{`Date: ${label}`}</p>
          <p style={{ color: '#00FF7F', margin: '4px 0' }}>
            {`Questions Solved: ${payload[0]?.value || 0}`}
          </p>
          <p style={{ color: '#AAAAAA', margin: '4px 0' }}>
            {`Target: ${payload[1]?.value || 0}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 mt-4">
      <h4 style={{ 
        color: '#FFFFFF', 
        fontSize: '1rem', 
        fontWeight: 500, 
        marginBottom: '16px' 
      }}>
        {title}
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis 
            dataKey="date" 
            stroke="#AAAAAA" 
            fontSize={12}
          />
          <YAxis 
            stroke="#AAAAAA" 
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="solved" 
            stroke="#00FF7F" 
            strokeWidth={3}
            dot={{ fill: '#00FF7F', r: 4 }}
            name="Questions Solved"
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#AAAAAA" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Target Progress"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
