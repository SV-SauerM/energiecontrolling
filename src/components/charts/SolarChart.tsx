import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ConsumptionData } from '@/types/energy';

interface SolarChartProps {
  data: ConsumptionData[];
}

export const SolarChart = ({ data }: SolarChartProps) => {
  const chartData = data.map(d => ({
    month: d.month,
    'PV Ertrag': d.pvYield,
    'Eigenverbrauch': d.pvSelfConsumption,
  }));

  return (
    <div className="energy-card h-[350px]">
      <h3 className="text-lg font-semibold mb-4 text-solar">PV-Performance (kWh)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
