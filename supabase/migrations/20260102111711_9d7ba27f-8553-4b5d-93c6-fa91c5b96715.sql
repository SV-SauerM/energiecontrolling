-- Tabelle für Zählerstände
CREATE TABLE public.meter_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  cold_water NUMERIC NOT NULL DEFAULT 0,
  garden_water NUMERIC NOT NULL DEFAULT 0,
  electricity_light NUMERIC NOT NULL DEFAULT 0,
  heating_ht NUMERIC NOT NULL DEFAULT 0,
  heating_nt NUMERIC NOT NULL DEFAULT 0,
  pv_yield NUMERIC NOT NULL DEFAULT 0,
  pv_feed_in NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabelle für Zählerwechsel
CREATE TABLE public.meter_replacements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  meter_type TEXT NOT NULL CHECK (meter_type IN ('cold_water', 'garden_water', 'electricity_light', 'heating_ht', 'heating_nt', 'pv_yield', 'pv_feed_in')),
  old_final_reading NUMERIC NOT NULL,
  new_initial_reading NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS aktivieren (öffentlicher Zugriff für diese App ohne Auth)
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_replacements ENABLE ROW LEVEL SECURITY;

-- Öffentliche Policies (da keine Auth benötigt)
CREATE POLICY "Allow public read access" ON public.meter_readings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.meter_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.meter_readings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.meter_readings FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.meter_replacements FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.meter_replacements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.meter_replacements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.meter_replacements FOR DELETE USING (true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meter_readings_updated_at
  BEFORE UPDATE ON public.meter_readings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();