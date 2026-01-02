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

export interface MeterReplacement {
  id: string;
  date: string;
  meterType: 'cold_water' | 'garden_water' | 'electricity_light' | 'heating_ht' | 'heating_nt' | 'pv_yield' | 'pv_feed_in';
  oldFinalReading: number;
  newInitialReading: number;
  notes?: string;
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

export const METER_TYPE_LABELS: Record<MeterReplacement['meterType'], string> = {
  cold_water: 'Kaltwasser',
  garden_water: 'Gartenwasser',
  electricity_light: 'Strom Licht',
  heating_ht: 'Heizung HT',
  heating_nt: 'Heizung NT',
  pv_yield: 'PV Ertrag',
  pv_feed_in: 'PV Einspeisung',
};
