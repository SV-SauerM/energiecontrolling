import { MeterReading, ConsumptionData, YearlyConsumption, Warning } from '@/types/energy';

export const calculateConsumption = (
  current: MeterReading,
  previous: MeterReading | null
): ConsumptionData => {
  const date = new Date(current.date);
  const month = date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
  const year = date.getFullYear();

  if (!previous) {
    return {
      id: current.id,
      date: current.date,
      month,
      year,
      coldWater: 0,
      gardenWater: 0,
      totalWater: 0,
      electricityLight: 0,
      heatingHT: 0,
      heatingNT: 0,
      totalHeating: 0,
      pvYield: current.pvYield,
      pvFeedIn: current.pvFeedIn,
      pvSelfConsumption: current.pvYield - current.pvFeedIn,
    };
  }

  const coldWater = Math.max(0, current.coldWater - previous.coldWater);
  const gardenWater = Math.max(0, current.gardenWater - previous.gardenWater);
  const electricityLight = Math.max(0, current.electricityLight - previous.electricityLight);
  const heatingHT = Math.max(0, current.heatingHT - previous.heatingHT);
  const heatingNT = Math.max(0, current.heatingNT - previous.heatingNT);
  const pvYield = Math.max(0, current.pvYield - previous.pvYield);
  const pvFeedIn = Math.max(0, current.pvFeedIn - previous.pvFeedIn);

  return {
    id: current.id,
    date: current.date,
    month,
    year,
    coldWater,
    gardenWater,
    totalWater: coldWater + gardenWater,
    electricityLight,
    heatingHT,
    heatingNT,
    totalHeating: heatingHT + heatingNT,
    pvYield,
    pvFeedIn,
    pvSelfConsumption: pvYield - pvFeedIn,
  };
};

export const calculateYearlyConsumption = (
  consumptionData: ConsumptionData[]
): YearlyConsumption[] => {
  const yearlyMap = new Map<number, YearlyConsumption>();

  consumptionData.forEach((data) => {
    const existing = yearlyMap.get(data.year);
    if (existing) {
      existing.totalWater += data.totalWater;
      existing.totalElectricity += data.electricityLight;
      existing.totalHeating += data.totalHeating;
      existing.totalPvYield += data.pvYield;
      existing.totalPvSelfConsumption += data.pvSelfConsumption;
    } else {
      yearlyMap.set(data.year, {
        year: data.year,
        totalWater: data.totalWater,
        totalElectricity: data.electricityLight,
        totalHeating: data.totalHeating,
        totalPvYield: data.pvYield,
        totalPvSelfConsumption: data.pvSelfConsumption,
      });
    }
  });

  return Array.from(yearlyMap.values()).sort((a, b) => a.year - b.year);
};

export const checkForWarnings = (
  currentData: ConsumptionData,
  historicalData: ConsumptionData[]
): Warning[] => {
  const warnings: Warning[] = [];
  const currentMonth = new Date(currentData.date).getMonth();
  
  // Get same month data from previous years
  const sameMonthData = historicalData.filter(d => {
    const month = new Date(d.date).getMonth();
    return month === currentMonth && d.id !== currentData.id;
  });

  if (sameMonthData.length === 0) return warnings;

  // Calculate averages
  const avgWater = sameMonthData.reduce((sum, d) => sum + d.totalWater, 0) / sameMonthData.length;
  const avgElectricity = sameMonthData.reduce((sum, d) => sum + d.electricityLight, 0) / sameMonthData.length;
  const avgHeating = sameMonthData.reduce((sum, d) => sum + d.totalHeating, 0) / sameMonthData.length;

  // Check for 30% threshold
  const threshold = 1.3;

  if (avgWater > 0 && currentData.totalWater > avgWater * threshold) {
    const percentage = ((currentData.totalWater - avgWater) / avgWater) * 100;
    warnings.push({
      type: 'water',
      message: `Wasserverbrauch ${percentage.toFixed(0)}% über Durchschnitt`,
      percentage,
      currentValue: currentData.totalWater,
      averageValue: avgWater,
    });
  }

  if (avgElectricity > 0 && currentData.electricityLight > avgElectricity * threshold) {
    const percentage = ((currentData.electricityLight - avgElectricity) / avgElectricity) * 100;
    warnings.push({
      type: 'electricity',
      message: `Stromverbrauch ${percentage.toFixed(0)}% über Durchschnitt`,
      percentage,
      currentValue: currentData.electricityLight,
      averageValue: avgElectricity,
    });
  }

  if (avgHeating > 0 && currentData.totalHeating > avgHeating * threshold) {
    const percentage = ((currentData.totalHeating - avgHeating) / avgHeating) * 100;
    warnings.push({
      type: 'heating',
      message: `Heizungsverbrauch ${percentage.toFixed(0)}% über Durchschnitt`,
      percentage,
      currentValue: currentData.totalHeating,
      averageValue: avgHeating,
    });
  }

  return warnings;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatNumber = (value: number, decimals: number = 1): string => {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Sample data for demonstration
export const sampleMeterReadings: MeterReading[] = [
  { id: '1', date: '2024-01-01', coldWater: 100, gardenWater: 20, electricityLight: 5000, heatingHT: 3000, heatingNT: 2000, pvYield: 200, pvFeedIn: 150 },
  { id: '2', date: '2024-02-01', coldWater: 112, gardenWater: 20, electricityLight: 5280, heatingHT: 3450, heatingNT: 2300, pvYield: 380, pvFeedIn: 280 },
  { id: '3', date: '2024-03-01', coldWater: 124, gardenWater: 22, electricityLight: 5520, heatingHT: 3800, heatingNT: 2520, pvYield: 650, pvFeedIn: 480 },
  { id: '4', date: '2024-04-01', coldWater: 138, gardenWater: 28, electricityLight: 5750, heatingHT: 4050, heatingNT: 2680, pvYield: 1100, pvFeedIn: 850 },
  { id: '5', date: '2024-05-01', coldWater: 155, gardenWater: 42, electricityLight: 5980, heatingHT: 4180, heatingNT: 2780, pvYield: 1650, pvFeedIn: 1300 },
  { id: '6', date: '2024-06-01', coldWater: 175, gardenWater: 65, electricityLight: 6200, heatingHT: 4250, heatingNT: 2830, pvYield: 2100, pvFeedIn: 1700 },
  { id: '7', date: '2024-07-01', coldWater: 198, gardenWater: 95, electricityLight: 6420, heatingHT: 4300, heatingNT: 2860, pvYield: 2500, pvFeedIn: 2050 },
  { id: '8', date: '2024-08-01', coldWater: 220, gardenWater: 120, electricityLight: 6650, heatingHT: 4350, heatingNT: 2890, pvYield: 2350, pvFeedIn: 1900 },
  { id: '9', date: '2024-09-01', coldWater: 238, gardenWater: 130, electricityLight: 6880, heatingHT: 4420, heatingNT: 2940, pvYield: 1800, pvFeedIn: 1400 },
  { id: '10', date: '2024-10-01', coldWater: 252, gardenWater: 132, electricityLight: 7130, heatingHT: 4600, heatingNT: 3080, pvYield: 1100, pvFeedIn: 800 },
  { id: '11', date: '2024-11-01', coldWater: 264, gardenWater: 132, electricityLight: 7400, heatingHT: 4900, heatingNT: 3280, pvYield: 500, pvFeedIn: 350 },
  { id: '12', date: '2024-12-01', coldWater: 275, gardenWater: 132, electricityLight: 7700, heatingHT: 5250, heatingNT: 3520, pvYield: 280, pvFeedIn: 180 },
];
