import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Minus, TrendingDown } from 'lucide-react';

interface ChartControlsProps {
  showMax: boolean;
  showAvg: boolean;
  showMin: boolean;
  onToggleMax: () => void;
  onToggleAvg: () => void;
  onToggleMin: () => void;
}

export const ChartControls = ({
  showMax,
  showAvg,
  showMin,
  onToggleMax,
  onToggleAvg,
  onToggleMin,
}: ChartControlsProps) => {
  return (
    <div className="flex gap-1 flex-wrap">
      <Button
        variant={showMax ? "default" : "outline"}
        size="sm"
        onClick={onToggleMax}
        className="h-6 px-2 text-xs"
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        Max
      </Button>
      <Button
        variant={showAvg ? "default" : "outline"}
        size="sm"
        onClick={onToggleAvg}
        className="h-6 px-2 text-xs"
      >
        <Minus className="w-3 h-3 mr-1" />
        Ø
      </Button>
      <Button
        variant={showMin ? "default" : "outline"}
        size="sm"
        onClick={onToggleMin}
        className="h-6 px-2 text-xs"
      >
        <TrendingDown className="w-3 h-3 mr-1" />
        Min
      </Button>
    </div>
  );
};

export const useChartReferenceLines = () => {
  const [showMax, setShowMax] = useState(false);
  const [showAvg, setShowAvg] = useState(false);
  const [showMin, setShowMin] = useState(false);

  return {
    showMax,
    showAvg,
    showMin,
    onToggleMax: () => setShowMax(!showMax),
    onToggleAvg: () => setShowAvg(!showAvg),
    onToggleMin: () => setShowMin(!showMin),
  };
};

export const calculateStats = (data: number[]) => {
  if (data.length === 0) return { max: 0, avg: 0, min: 0 };
  const filteredData = data.filter(v => v > 0);
  if (filteredData.length === 0) return { max: 0, avg: 0, min: 0 };
  
  const max = Math.max(...filteredData);
  const min = Math.min(...filteredData);
  const avg = filteredData.reduce((a, b) => a + b, 0) / filteredData.length;
  
  return { max, avg: Math.round(avg * 100) / 100, min };
};
