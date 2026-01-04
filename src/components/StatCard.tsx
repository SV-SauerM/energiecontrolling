import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber } from '@/lib/energyUtils';

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  icon: ReactNode;
  type: 'water' | 'electricity' | 'heating' | 'solar';
  previousValue?: number;
  meterNumber?: string | null;
}

export const StatCard = ({ title, value, unit, icon, type, previousValue, meterNumber }: StatCardProps) => {
  const getCardClass = () => {
    switch (type) {
      case 'water': return 'stat-card-water';
      case 'electricity': return 'stat-card-electricity';
      case 'heating': return 'stat-card-heating';
      case 'solar': return 'stat-card-solar';
    }
  };

  const getTextClass = () => {
    switch (type) {
      case 'water': return 'text-water';
      case 'electricity': return 'text-electricity';
      case 'heating': return 'text-heating';
      case 'solar': return 'text-solar';
    }
  };

  const getGlowClass = () => {
    switch (type) {
      case 'water': return 'glow-water';
      case 'electricity': return 'glow-electricity';
      case 'heating': return 'glow-heating';
      case 'solar': return 'glow-solar';
    }
  };

  const getTrend = () => {
    if (previousValue === undefined || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    
    if (Math.abs(change) < 1) {
      return { icon: Minus, text: '±0%', color: 'text-muted-foreground' };
    }
    
    if (type === 'solar') {
      // For solar, increase is good
      return change > 0 
        ? { icon: TrendingUp, text: `+${change.toFixed(0)}%`, color: 'text-success' }
        : { icon: TrendingDown, text: `${change.toFixed(0)}%`, color: 'text-destructive' };
    }
    
    // For consumption, decrease is good
    return change > 0 
      ? { icon: TrendingUp, text: `+${change.toFixed(0)}%`, color: 'text-destructive' }
      : { icon: TrendingDown, text: `${change.toFixed(0)}%`, color: 'text-success' };
  };

  const trend = getTrend();

  return (
    <div className={`stat-card ${getCardClass()} ${getGlowClass()} animate-slide-up`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-background/50 ${getTextClass()}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.color}`}>
            <trend.icon className="w-3 h-3" />
            {trend.text}
          </div>
        )}
      </div>
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      {meterNumber && (
        <p className="text-xs text-muted-foreground/70 font-mono mb-1">Nr. {meterNumber}</p>
      )}
      
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl lg:text-3xl font-bold font-mono ${getTextClass()}`}>
          {formatNumber(value)}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
};
