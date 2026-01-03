-- Create table for meter information (meter numbers)
CREATE TABLE public.meter_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_type text NOT NULL UNIQUE,
  meter_number text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meter_info ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (same as other tables)
CREATE POLICY "Allow public read access" ON public.meter_info FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.meter_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.meter_info FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.meter_info FOR DELETE USING (true);

-- Insert default meter types
INSERT INTO public.meter_info (meter_type, meter_number) VALUES
  ('cold_water', NULL),
  ('garden_water', NULL),
  ('electricity_light', NULL),
  ('heating_ht', NULL),
  ('heating_nt', NULL),
  ('pv_yield', NULL),
  ('pv_feed_in', NULL);