import { useState, useEffect, useMemo } from 'react';
import { MeterReading, ConsumptionData, YearlyConsumption, Warning, MeterReplacement } from '@/types/energy';
import { 
  calculateConsumption, 
  calculateYearlyConsumption, 
  checkForWarnings,
  generateId 
} from '@/lib/energyUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEnergyData = () => {
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);
  const [meterReplacements, setMeterReplacements] = useState<MeterReplacement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [readingsResult, replacementsResult] = await Promise.all([
          supabase
            .from('meter_readings')
            .select('*')
            .order('date', { ascending: true }),
          supabase
            .from('meter_replacements')
            .select('*')
            .order('date', { ascending: true })
        ]);

        if (readingsResult.error) throw readingsResult.error;
        if (replacementsResult.error) throw replacementsResult.error;

        const readings: MeterReading[] = (readingsResult.data || []).map(r => ({
          id: r.id,
          date: r.date,
          coldWater: Number(r.cold_water),
          gardenWater: Number(r.garden_water),
          electricityLight: Number(r.electricity_light),
          heatingHT: Number(r.heating_ht),
          heatingNT: Number(r.heating_nt),
          pvYield: Number(r.pv_yield),
          pvFeedIn: Number(r.pv_feed_in),
        }));

        const replacements: MeterReplacement[] = (replacementsResult.data || []).map(r => ({
          id: r.id,
          date: r.date,
          meterType: r.meter_type as MeterReplacement['meterType'],
          oldFinalReading: Number(r.old_final_reading),
          newInitialReading: Number(r.new_initial_reading),
          notes: r.notes || undefined,
        }));

        setMeterReadings(readings);
        setMeterReplacements(replacements);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Fehler beim Laden der Daten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate consumption data with meter replacements
  const consumptionData = useMemo((): ConsumptionData[] => {
    const sorted = [...meterReadings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((reading, index) => 
      calculateConsumption(reading, index > 0 ? sorted[index - 1] : null, meterReplacements)
    );
  }, [meterReadings, meterReplacements]);

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
  const addReading = async (reading: Omit<MeterReading, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .insert({
          date: reading.date,
          cold_water: reading.coldWater,
          garden_water: reading.gardenWater,
          electricity_light: reading.electricityLight,
          heating_ht: reading.heatingHT,
          heating_nt: reading.heatingNT,
          pv_yield: reading.pvYield,
          pv_feed_in: reading.pvFeedIn,
        })
        .select()
        .single();

      if (error) throw error;

      const newReading: MeterReading = {
        id: data.id,
        date: data.date,
        coldWater: Number(data.cold_water),
        gardenWater: Number(data.garden_water),
        electricityLight: Number(data.electricity_light),
        heatingHT: Number(data.heating_ht),
        heatingNT: Number(data.heating_nt),
        pvYield: Number(data.pv_yield),
        pvFeedIn: Number(data.pv_feed_in),
      };

      setMeterReadings(prev => [...prev, newReading].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      toast.success('Zählerstand gespeichert');
    } catch (error) {
      console.error('Error adding reading:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  // Update existing reading
  const updateReading = async (id: string, reading: Partial<MeterReading>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (reading.date !== undefined) updateData.date = reading.date;
      if (reading.coldWater !== undefined) updateData.cold_water = reading.coldWater;
      if (reading.gardenWater !== undefined) updateData.garden_water = reading.gardenWater;
      if (reading.electricityLight !== undefined) updateData.electricity_light = reading.electricityLight;
      if (reading.heatingHT !== undefined) updateData.heating_ht = reading.heatingHT;
      if (reading.heatingNT !== undefined) updateData.heating_nt = reading.heatingNT;
      if (reading.pvYield !== undefined) updateData.pv_yield = reading.pvYield;
      if (reading.pvFeedIn !== undefined) updateData.pv_feed_in = reading.pvFeedIn;

      const { error } = await supabase
        .from('meter_readings')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setMeterReadings(prev => 
        prev.map(r => r.id === id ? { ...r, ...reading } : r)
      );
      toast.success('Zählerstand aktualisiert');
    } catch (error) {
      console.error('Error updating reading:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  // Delete reading
  const deleteReading = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meter_readings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMeterReadings(prev => prev.filter(r => r.id !== id));
      toast.success('Zählerstand gelöscht');
    } catch (error) {
      console.error('Error deleting reading:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  // Add meter replacement
  const addMeterReplacement = async (replacement: Omit<MeterReplacement, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('meter_replacements')
        .insert({
          date: replacement.date,
          meter_type: replacement.meterType,
          old_final_reading: replacement.oldFinalReading,
          new_initial_reading: replacement.newInitialReading,
          notes: replacement.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newReplacement: MeterReplacement = {
        id: data.id,
        date: data.date,
        meterType: data.meter_type as MeterReplacement['meterType'],
        oldFinalReading: Number(data.old_final_reading),
        newInitialReading: Number(data.new_initial_reading),
        notes: data.notes || undefined,
      };

      setMeterReplacements(prev => [...prev, newReplacement].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      toast.success('Zählerwechsel gespeichert');
    } catch (error) {
      console.error('Error adding replacement:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  // Delete meter replacement
  const deleteMeterReplacement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meter_replacements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMeterReplacements(prev => prev.filter(r => r.id !== id));
      toast.success('Zählerwechsel gelöscht');
    } catch (error) {
      console.error('Error deleting replacement:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  // Set all readings (for import)
  const setReadings = async (readings: MeterReading[]) => {
    try {
      // Delete all existing readings
      await supabase.from('meter_readings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert all new readings
      const insertData = readings.map(r => ({
        date: r.date,
        cold_water: r.coldWater,
        garden_water: r.gardenWater,
        electricity_light: r.electricityLight,
        heating_ht: r.heatingHT,
        heating_nt: r.heatingNT,
        pv_yield: r.pvYield,
        pv_feed_in: r.pvFeedIn,
      }));

      const { data, error } = await supabase
        .from('meter_readings')
        .insert(insertData)
        .select();

      if (error) throw error;

      const newReadings: MeterReading[] = (data || []).map(r => ({
        id: r.id,
        date: r.date,
        coldWater: Number(r.cold_water),
        gardenWater: Number(r.garden_water),
        electricityLight: Number(r.electricity_light),
        heatingHT: Number(r.heating_ht),
        heatingNT: Number(r.heating_nt),
        pvYield: Number(r.pv_yield),
        pvFeedIn: Number(r.pv_feed_in),
      }));

      const sorted = newReadings.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setMeterReadings(sorted);
      toast.success(`${sorted.length} Zählerstände importiert`);
    } catch (error) {
      console.error('Error setting readings:', error);
      toast.error('Fehler beim Import');
    }
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
    meterReplacements,
    consumptionData,
    yearlyData,
    warnings,
    latestReading,
    isLoading,
    addReading,
    updateReading,
    deleteReading,
    setReadings,
    addMeterReplacement,
    deleteMeterReplacement,
  };
};
