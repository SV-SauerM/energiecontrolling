import { MeterReading, ConsumptionData, YearlyConsumption, Warning, MeterReplacement } from '@/types/energy';

// Helper to get meter replacements between two dates for a specific meter type
const getMeterReplacementsBetween = (
  replacements: MeterReplacement[],
  meterType: MeterReplacement['meterType'],
  startDate: string,
  endDate: string
): MeterReplacement[] => {
  return replacements.filter(r => 
    r.meterType === meterType &&
    new Date(r.date) > new Date(startDate) &&
    new Date(r.date) <= new Date(endDate)
  );
};

// Calculate consumption accounting for meter replacements
const calculateMeterConsumption = (
  current: number,
  previous: number,
  meterType: MeterReplacement['meterType'],
  currentDate: string,
  previousDate: string,
  replacements: MeterReplacement[]
): number => {
  const relevantReplacements = getMeterReplacementsBetween(
    replacements,
    meterType,
    previousDate,
    currentDate
  );

  if (relevantReplacements.length === 0) {
    return Math.max(0, current - previous);
  }

  // If there was a meter replacement, calculate consumption as:
  // (old final reading - previous reading) + (current reading - new initial reading)
  let consumption = 0;
  let lastReading = previous;
  let lastDate = previousDate;

  for (const replacement of relevantReplacements) {
    // Add consumption up to the replacement
    consumption += Math.max(0, replacement.oldFinalReading - lastReading);
    // Start from new meter initial reading
    lastReading = replacement.newInitialReading;
    lastDate = replacement.date;
  }

  // Add consumption from last replacement to current
  consumption += Math.max(0, current - lastReading);

  return consumption;
};

export const calculateConsumption = (
  current: MeterReading,
  previous: MeterReading | null,
  replacements: MeterReplacement[] = []
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

  const coldWater = calculateMeterConsumption(
    current.coldWater, previous.coldWater, 'cold_water', 
    current.date, previous.date, replacements
  );
  const gardenWater = calculateMeterConsumption(
    current.gardenWater, previous.gardenWater, 'garden_water',
    current.date, previous.date, replacements
  );
  const electricityLight = calculateMeterConsumption(
    current.electricityLight, previous.electricityLight, 'electricity_light',
    current.date, previous.date, replacements
  );
  const heatingHT = calculateMeterConsumption(
    current.heatingHT, previous.heatingHT, 'heating_ht',
    current.date, previous.date, replacements
  );
  const heatingNT = calculateMeterConsumption(
    current.heatingNT, previous.heatingNT, 'heating_nt',
    current.date, previous.date, replacements
  );
  const pvYield = calculateMeterConsumption(
    current.pvYield, previous.pvYield, 'pv_yield',
    current.date, previous.date, replacements
  );
  const pvFeedIn = calculateMeterConsumption(
    current.pvFeedIn, previous.pvFeedIn, 'pv_feed_in',
    current.date, previous.date, replacements
  );

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
