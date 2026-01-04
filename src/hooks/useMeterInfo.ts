import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MeterInfo {
  meterType: string;
  meterNumber: string | null;
}

export const useMeterInfo = () => {
  const [meterInfo, setMeterInfo] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeterInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('meter_info')
          .select('meter_type, meter_number');

        if (error) throw error;

        const infoMap: Record<string, string | null> = {};
        (data || []).forEach((m) => {
          infoMap[m.meter_type] = m.meter_number;
        });
        setMeterInfo(infoMap);
      } catch (error) {
        console.error('Error fetching meter info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeterInfo();
  }, []);

  return { meterInfo, isLoading };
};
