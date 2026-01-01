import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ConsumptionData } from '@/types/energy';

interface HeatingChartProps {
  data: ConsumptionData[];
}

export const HeatingChart = ({ data }: HeatingChartProps) => {
  const chartData = data.map(d => ({
    month: d.month,
    'Heizung HT': d.heatingHT,
    'Heizung NT': d.heatingNT,
  }));

  return (
    <div className="energy-card h-[350px]">
      <h3 className="text-lg font-semibold mb-4 text-heating">Heizstromverbrauch (kWh)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="heatingHTGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="heatingNTGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(12, 76%, 61%)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="hsl(12, 76%, 61%)" stopOpacity={0.1} />
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
            dataKey="Heizung HT" 
            stackId="1"
            stroke="hsl(25, 95%, 53%)" 
            fill="url(#heatingHTGradient)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="Heizung NT" 
            stackId="1"
            stroke="hsl(12, 76%, 61%)" 
            fill="url(#heatingNTGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
