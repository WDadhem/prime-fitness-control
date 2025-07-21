-- Mettre à jour les politiques RLS pour permettre l'insertion publique d'offres

-- Politique pour offres
DROP POLICY IF EXISTS "Authenticated users can insert offres" ON public.offres;
CREATE POLICY "Anyone can insert offres" ON public.offres
FOR INSERT WITH CHECK (true);

-- Aussi pour les mises à jour et suppressions
DROP POLICY IF EXISTS "Authenticated users can update offres" ON public.offres;
CREATE POLICY "Anyone can update offres" ON public.offres
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete offres" ON public.offres;
CREATE POLICY "Anyone can delete offres" ON public.offres
FOR DELETE USING (true);