-- Drop existing public policies for meter_readings
DROP POLICY IF EXISTS "Allow public delete access" ON public.meter_readings;
DROP POLICY IF EXISTS "Allow public insert access" ON public.meter_readings;
DROP POLICY IF EXISTS "Allow public read access" ON public.meter_readings;
DROP POLICY IF EXISTS "Allow public update access" ON public.meter_readings;

-- Create authenticated-only policies for meter_readings
CREATE POLICY "Authenticated users can read meter_readings"
ON public.meter_readings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert meter_readings"
ON public.meter_readings
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update meter_readings"
ON public.meter_readings
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete meter_readings"
ON public.meter_readings
FOR DELETE
TO authenticated
USING (true);

-- Drop existing public policies for meter_info
DROP POLICY IF EXISTS "Allow public delete access" ON public.meter_info;
DROP POLICY IF EXISTS "Allow public insert access" ON public.meter_info;
DROP POLICY IF EXISTS "Allow public read access" ON public.meter_info;
DROP POLICY IF EXISTS "Allow public update access" ON public.meter_info;

-- Create authenticated-only policies for meter_info
CREATE POLICY "Authenticated users can read meter_info"
ON public.meter_info
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert meter_info"
ON public.meter_info
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update meter_info"
ON public.meter_info
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete meter_info"
ON public.meter_info
FOR DELETE
TO authenticated
USING (true);

-- Drop existing public policies for meter_replacements
DROP POLICY IF EXISTS "Allow public delete access" ON public.meter_replacements;
DROP POLICY IF EXISTS "Allow public insert access" ON public.meter_replacements;
DROP POLICY IF EXISTS "Allow public read access" ON public.meter_replacements;
DROP POLICY IF EXISTS "Allow public update access" ON public.meter_replacements;

-- Create authenticated-only policies for meter_replacements
CREATE POLICY "Authenticated users can read meter_replacements"
ON public.meter_replacements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert meter_replacements"
ON public.meter_replacements
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update meter_replacements"
ON public.meter_replacements
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete meter_replacements"
ON public.meter_replacements
FOR DELETE
TO authenticated
USING (true);