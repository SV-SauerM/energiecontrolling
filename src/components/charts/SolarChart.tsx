import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush, ReferenceLine } from 'recharts';
import { ConsumptionData } from '@/types/energy';
import { ChartControls, useChartReferenceLines, calculateStats } from './ChartControls';

interface SolarChartProps {
  data: ConsumptionData[];
}

export const SolarChart = ({ data }: SolarChartProps) => {
  const chartData = data.map(d => ({
    month: d.month,
    'PV Ertrag': d.pvYield,
    'Eigenverbrauch': d.pvSelfConsumption,
  }));

  const refLineControls = useChartReferenceLines();
  const yieldStats = calculateStats(data.map(d => d.pvYield));

  return (
    <div className="energy-card h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-solar">PV-Performance (kWh)</h3>
        <ChartControls {...refLineControls} />
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
          <defs>
            <linearGradient id="solarYieldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="solarSelfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(80, 70%, 50%)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="hsl(80, 70%, 50%)" stopOpacity={0.1} />
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
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          {refLineControls.showMax && (
            <ReferenceLine y={yieldStats.max} stroke="hsl(0, 84%, 60%)" strokeDasharray="5 5" label={{ value: `Max: ${yieldStats.max}`, fill: 'hsl(0, 84%, 60%)', fontSize: 10 }} />
          )}
          {refLineControls.showAvg && (
            <ReferenceLine y={yieldStats.avg} stroke="hsl(45, 93%, 47%)" strokeDasharray="5 5" label={{ value: `Ø: ${yieldStats.avg}`, fill: 'hsl(45, 93%, 47%)', fontSize: 10 }} />
          )}
          {refLineControls.showMin && (
            <ReferenceLine y={yieldStats.min} stroke="hsl(142, 71%, 45%)" strokeDasharray="5 5" label={{ value: `Min: ${yieldStats.min}`, fill: 'hsl(142, 71%, 45%)', fontSize: 10 }} />
          )}
          <Area 
            type="monotone" 
            dataKey="PV Ertrag" 
            stroke="hsl(142, 71%, 45%)" 
            fill="url(#solarYieldGradient)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="Eigenverbrauch" 
            stroke="hsl(80, 70%, 50%)" 
            fill="url(#solarSelfGradient)"
            strokeWidth={2}
          />
          <Brush 
            dataKey="month" 
            height={20} 
            stroke="hsl(142, 71%, 45%)"
            fill="hsl(222, 47%, 14%)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
