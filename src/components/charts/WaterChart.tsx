import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ConsumptionData } from '@/types/energy';

interface WaterChartProps {
  data: ConsumptionData[];
}

export const WaterChart = ({ data }: WaterChartProps) => {
  const chartData = data.map(d => ({
    month: d.month,
    Kaltwasser: d.coldWater,
    Gartenwasser: d.gardenWater,
    Gesamt: d.totalWater,
  }));

  return (
    <div className="energy-card h-[350px]">
      <h3 className="text-lg font-semibold mb-4 text-water">Wasserverbrauch (m³)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gardenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0} />
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
            dataKey="Kaltwasser" 
            stroke="hsl(199, 89%, 48%)" 
            fill="url(#waterGradient)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="Gartenwasser" 
            stroke="hsl(173, 80%, 40%)" 
            fill="url(#gardenGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
