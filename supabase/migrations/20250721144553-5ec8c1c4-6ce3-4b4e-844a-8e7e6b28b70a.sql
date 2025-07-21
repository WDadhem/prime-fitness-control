-- Update RLS policy for offres table to allow public read access
DROP POLICY IF EXISTS "Authenticated users can manage all data" ON public.offres;

-- Create new policies for public read access and authenticated write access
CREATE POLICY "Anyone can view offres" ON public.offres
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert offres" ON public.offres
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can update offres" ON public.offres
  FOR UPDATE USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can delete offres" ON public.offres
  FOR DELETE USING (auth.role() = 'authenticated'::text);