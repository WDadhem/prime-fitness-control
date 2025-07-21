-- Update RLS policies for inscription tables to allow public read access

-- Update inscriptions_adultes table
DROP POLICY IF EXISTS "Authenticated users can manage all data" ON public.inscriptions_adultes;

CREATE POLICY "Anyone can view inscriptions_adultes" ON public.inscriptions_adultes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert inscriptions_adultes" ON public.inscriptions_adultes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can update inscriptions_adultes" ON public.inscriptions_adultes
  FOR UPDATE USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can delete inscriptions_adultes" ON public.inscriptions_adultes
  FOR DELETE USING (auth.role() = 'authenticated'::text);

-- Update inscriptions_enfants table
DROP POLICY IF EXISTS "Authenticated users can manage all data" ON public.inscriptions_enfants;

CREATE POLICY "Anyone can view inscriptions_enfants" ON public.inscriptions_enfants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert inscriptions_enfants" ON public.inscriptions_enfants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can update inscriptions_enfants" ON public.inscriptions_enfants
  FOR UPDATE USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can delete inscriptions_enfants" ON public.inscriptions_enfants
  FOR DELETE USING (auth.role() = 'authenticated'::text);

-- Update inscriptions_femmes table
DROP POLICY IF EXISTS "Authenticated users can manage all data" ON public.inscriptions_femmes;

CREATE POLICY "Anyone can view inscriptions_femmes" ON public.inscriptions_femmes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert inscriptions_femmes" ON public.inscriptions_femmes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can update inscriptions_femmes" ON public.inscriptions_femmes
  FOR UPDATE USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can delete inscriptions_femmes" ON public.inscriptions_femmes
  FOR DELETE USING (auth.role() = 'authenticated'::text);