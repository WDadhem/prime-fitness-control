-- Create admins table
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offres table
CREATE TABLE public.offres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  coach TEXT,
  categorie TEXT NOT NULL CHECK (categorie IN ('Femme', 'Enfant', 'Adulte', 'Mixte')),
  prix DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inscriptions_femmes table
CREATE TABLE public.inscriptions_femmes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  age INTEGER NOT NULL,
  telephone TEXT NOT NULL,
  specialite TEXT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  duree_abonnement TEXT NOT NULL CHECK (duree_abonnement IN ('1 mois', '2 mois', '3 mois', '6 mois', '1 an')),
  offre_id UUID REFERENCES public.offres(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inscriptions_enfants table
CREATE TABLE public.inscriptions_enfants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  age INTEGER NOT NULL,
  telephone TEXT NOT NULL,
  specialite TEXT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  duree_abonnement TEXT NOT NULL CHECK (duree_abonnement IN ('1 mois', '2 mois', '3 mois', '6 mois', '1 an')),
  offre_id UUID REFERENCES public.offres(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inscriptions_adultes table
CREATE TABLE public.inscriptions_adultes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  age INTEGER NOT NULL,
  telephone TEXT NOT NULL,
  specialite TEXT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  duree_abonnement TEXT NOT NULL CHECK (duree_abonnement IN ('1 mois', '2 mois', '3 mois', '6 mois', '1 an')),
  offre_id UUID REFERENCES public.offres(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscriptions_femmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscriptions_enfants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscriptions_adultes ENABLE ROW LEVEL SECURITY;

-- Create policies for admins (authenticated users can manage everything)
CREATE POLICY "Authenticated users can manage all data" ON public.admins FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all data" ON public.offres FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all data" ON public.inscriptions_femmes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all data" ON public.inscriptions_enfants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage all data" ON public.inscriptions_adultes FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offres_updated_at BEFORE UPDATE ON public.offres FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inscriptions_femmes_updated_at BEFORE UPDATE ON public.inscriptions_femmes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inscriptions_enfants_updated_at BEFORE UPDATE ON public.inscriptions_enfants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inscriptions_adultes_updated_at BEFORE UPDATE ON public.inscriptions_adultes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();