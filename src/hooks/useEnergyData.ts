import { useState, useEffect, useMemo } from 'react';
import { MeterReading, ConsumptionData, YearlyConsumption, Warning } from '@/types/energy';
import { 
  calculateConsumption, 
  calculateYearlyConsumption, 
  checkForWarnings,
  sampleMeterReadings,
  generateId 
} from '@/lib/energyUtils';

const STORAGE_KEY = 'energy-meter-readings';

export const useEnergyData = () => {
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMeterReadings(JSON.parse(stored));
      } catch {
        setMeterReadings(sampleMeterReadings);
      }
    } else {
      // Initialize with sample data
      setMeterReadings(sampleMeterReadings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleMeterReadings));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading && meterReadings.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meterReadings));
    }
  }, [meterReadings, isLoading]);

  // Calculate consumption data
  const consumptionData = useMemo((): ConsumptionData[] => {
    const sorted = [...meterReadings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((reading, index) => 
      calculateConsumption(reading, index > 0 ? sorted[index - 1] : null)
    );
  }, [meterReadings]);

  // Calculate yearly totals
  const yearlyData = useMemo((): YearlyConsumption[] => {
    return calculateYearlyConsumption(consumptionData);
  }, [consumptionData]);

  // Get current warnings
  const warnings = useMemo((): Warning[] => {
    if (consumptionData.length < 2) return [];
    const latest = consumptionData[consumptionData.length - 1];
    return checkForWarnings(latest, consumptionData);
  }, [consumptionData]);

  // Add new meter reading
  const addReading = (reading: Omit<MeterReading, 'id'>) => {
    const newReading: MeterReading = {
      ...reading,
      id: generateId(),
    };
    setMeterReadings(prev => [...prev, newReading].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
  };

  // Update existing reading
  const updateReading = (id: string, reading: Partial<MeterReading>) => {
    setMeterReadings(prev => 
      prev.map(r => r.id === id ? { ...r, ...reading } : r)
    );
  };

  // Delete reading
  const deleteReading = (id: string) => {
    setMeterReadings(prev => prev.filter(r => r.id !== id));
  };

  // Get latest reading for form defaults
  const latestReading = useMemo(() => {
    if (meterReadings.length === 0) return null;
    return [...meterReadings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, [meterReadings]);

  return {
    meterReadings,
    consumptionData,
    yearlyData,
    warnings,
    latestReading,
    isLoading,
    addReading,
    updateReading,
    deleteReading,
  };
};
