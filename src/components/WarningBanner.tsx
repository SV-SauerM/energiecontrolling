import { AlertTriangle } from 'lucide-react';
import { Warning } from '@/types/energy';
import { formatNumber } from '@/lib/energyUtils';

interface WarningBannerProps {
  warnings: Warning[];
}

export const WarningBanner = ({ warnings }: WarningBannerProps) => {
  if (warnings.length === 0) return null;

  const getIcon = (type: Warning['type']) => {
    switch (type) {
      case 'water': return '💧';
      case 'electricity': return '⚡';
      case 'heating': return '🔥';
    }
  };

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6 animate-slide-up">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="font-semibold text-warning">Verbrauchswarnung</h4>
          <div className="space-y-1">
            {warnings.map((warning, index) => (
              <div key={index} className="text-sm text-foreground/80 flex items-center gap-2">
                <span>{getIcon(warning.type)}</span>
                <span>{warning.message}</span>
                <span className="text-muted-foreground">
                  (Aktuell: {formatNumber(warning.currentValue)} / Ø {formatNumber(warning.averageValue)})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
