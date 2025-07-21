-- Mettre à jour les politiques RLS pour permettre l'insertion publique

-- Politiques pour inscriptions_adultes
DROP POLICY IF EXISTS "Authenticated users can insert inscriptions_adultes" ON public.inscriptions_adultes;
CREATE POLICY "Anyone can insert inscriptions_adultes" ON public.inscriptions_adultes
FOR INSERT WITH CHECK (true);

-- Politiques pour inscriptions_enfants  
DROP POLICY IF EXISTS "Authenticated users can insert inscriptions_enfants" ON public.inscriptions_enfants;
CREATE POLICY "Anyone can insert inscriptions_enfants" ON public.inscriptions_enfants
FOR INSERT WITH CHECK (true);

-- Politiques pour inscriptions_femmes
DROP POLICY IF EXISTS "Authenticated users can insert inscriptions_femmes" ON public.inscriptions_femmes;
CREATE POLICY "Anyone can insert inscriptions_femmes" ON public.inscriptions_femmes
FOR INSERT WITH CHECK (true);