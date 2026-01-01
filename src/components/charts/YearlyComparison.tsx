import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { YearlyConsumption } from '@/types/energy';

interface YearlyComparisonProps {
  data: YearlyConsumption[];
}

export const YearlyComparison = ({ data }: YearlyComparisonProps) => {
  const chartData = data.map(d => ({
    Jahr: d.year.toString(),
    Wasser: d.totalWater,
    Strom: d.totalElectricity,
    Heizung: d.totalHeating,
    'PV Ertrag': d.totalPvYield,
  }));

  return (
    <div className="energy-card h-[400px]">
      <h3 className="text-lg font-semibold mb-4 text-primary">Jahresübersicht</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" />
          <XAxis 
            dataKey="Jahr" 
            tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
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
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar 
            dataKey="Wasser" 
            fill="hsl(199, 89%, 48%)"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="Strom" 
            fill="hsl(45, 93%, 47%)"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="Heizung" 
            fill="hsl(25, 95%, 53%)"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="PV Ertrag" 
            fill="hsl(142, 71%, 45%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
