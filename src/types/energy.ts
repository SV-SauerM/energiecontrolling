export interface MeterReading {
  id: string;
  date: string;
  coldWater: number;
  gardenWater: number;
  electricityLight: number;
  heatingHT: number;
  heatingNT: number;
  pvYield: number;
  pvFeedIn: number;
}

export interface ConsumptionData {
  id: string;
  date: string;
  month: string;
  year: number;
  coldWater: number;
  gardenWater: number;
  totalWater: number;
  electricityLight: number;
  heatingHT: number;
  heatingNT: number;
  totalHeating: number;
  pvYield: number;
  pvFeedIn: number;
  pvSelfConsumption: number;
}

export interface YearlyConsumption {
  year: number;
  totalWater: number;
  totalElectricity: number;
  totalHeating: number;
  totalPvYield: number;
  totalPvSelfConsumption: number;
}

export interface Warning {
  type: 'water' | 'electricity' | 'heating';
  message: string;
  percentage: number;
  currentValue: number;
  averageValue: number;
}
