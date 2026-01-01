import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ConsumptionData } from '@/types/energy';

interface ElectricityChartProps {
  data: ConsumptionData[];
}

export const ElectricityChart = ({ data }: ElectricityChartProps) => {
  const chartData = data.map(d => ({
    month: d.month,
    Verbrauch: d.electricityLight,
  }));

  return (
    <div className="energy-card h-[350px]">
      <h3 className="text-lg font-semibold mb-4 text-electricity">Stromverbrauch Licht (kWh)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="electricityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(45, 93%, 47%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(45, 93%, 37%)" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(217, 33%, 22%)' }}
            tickLine={{ stroke: 'hsl(217, 33%, 22%)' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(217, 33%, 22%)' }}
            tickLine={{ stroke: 'hsl(217, 33%, 22%)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(222, 47%, 14%)', 
              border: '1px solid hsl(217, 33%, 22%)',
              borderRadius: '8px',
              color: 'hsl(210, 40%, 98%)'
            }}
            labelStyle={{ color: 'hsl(215, 20%, 65%)' }}
            cursor={{ fill: 'hsl(217, 33%, 17%, 0.5)' }}
          />
          <Bar 
            dataKey="Verbrauch" 
            fill="url(#electricityGradient)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
