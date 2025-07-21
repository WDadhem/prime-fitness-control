-- Supprimer et recréer les politiques pour la table offres

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Anyone can insert offres" ON public.offres;
DROP POLICY IF EXISTS "Anyone can update offres" ON public.offres;  
DROP POLICY IF EXISTS "Anyone can delete offres" ON public.offres;

-- Recréer les politiques pour permettre toutes les opérations publiquement
CREATE POLICY "Public can insert offres" ON public.offres
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update offres" ON public.offres
FOR UPDATE USING (true);

CREATE POLICY "Public can delete offres" ON public.offres
FOR DELETE USING (true);