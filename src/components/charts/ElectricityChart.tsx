import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import { ConsumptionData } from '@/types/energy';
import { ChartControls, useChartReferenceLines, calculateStats } from './ChartControls';

interface ElectricityChartProps {
  data: ConsumptionData[];
}

export const ElectricityChart = ({ data }: ElectricityChartProps) => {
  const chartData = data.map(d => ({
    month: d.month,
    Verbrauch: d.electricityLight,
  }));

  const refLineControls = useChartReferenceLines();
  const stats = calculateStats(data.map(d => d.electricityLight));

  return (
    <div className="energy-card h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-electricity">Stromverbrauch Licht (kWh)</h3>
        <ChartControls {...refLineControls} />
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
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
          {refLineControls.showMax && (
            <ReferenceLine y={stats.max} stroke="hsl(0, 84%, 60%)" strokeDasharray="5 5" label={{ value: `Max: ${stats.max}`, fill: 'hsl(0, 84%, 60%)', fontSize: 10 }} />
          )}
          {refLineControls.showAvg && (
            <ReferenceLine y={stats.avg} stroke="hsl(45, 93%, 47%)" strokeDasharray="5 5" label={{ value: `Ø: ${stats.avg}`, fill: 'hsl(45, 93%, 47%)', fontSize: 10 }} />
          )}
          {refLineControls.showMin && (
            <ReferenceLine y={stats.min} stroke="hsl(142, 71%, 45%)" strokeDasharray="5 5" label={{ value: `Min: ${stats.min}`, fill: 'hsl(142, 71%, 45%)', fontSize: 10 }} />
          )}
          <Bar 
            dataKey="Verbrauch" 
            fill="url(#electricityGradient)"
            radius={[4, 4, 0, 0]}
          />
          <Brush 
            dataKey="month" 
            height={20} 
            stroke="hsl(45, 93%, 47%)"
            fill="hsl(222, 47%, 14%)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
