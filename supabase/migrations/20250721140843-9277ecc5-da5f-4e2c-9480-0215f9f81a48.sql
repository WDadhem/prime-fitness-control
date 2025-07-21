-- Insérer les vraies offres pour enfants
INSERT INTO public.offres (nom, coach, categorie, prix, description) VALUES
('Karate Kyokushinkai', 'Nizar Chikh Brahim', 'Enfant', 50, 'Art martial traditionnel japonais'),
('Karate Shotokan', 'Souhaiel Ben Hessine', 'Enfant', 50, 'Art martial traditionnel japonais'),
('Gymnastique', 'Wassel Hajjem', 'Enfant', 45, 'Développement de la souplesse et coordination'),
('Kick Boxing', 'Hani El Mechi', 'Enfant', 55, 'Sports de combat moderne'),
('Taekwondo', 'Chokri Mabrouk', 'Enfant', 50, 'Art martial coréen');

-- Insérer les offres pour adultes (hommes et femmes)
INSERT INTO public.offres (nom, coach, categorie, prix, description) VALUES
('Kick Boxing', NULL, 'Adulte', 80, 'Sports de combat pour adultes'),
('Musculation', NULL, 'Adulte', 60, 'Renforcement musculaire'),
('Crossfit', NULL, 'Adulte', 90, 'Entraînement fonctionnel haute intensité'),
('Musculation + Crossfit', NULL, 'Adulte', 120, 'Combinaison musculation et crossfit'),
('Musculation + Cardio', NULL, 'Adulte', 100, 'Combinaison musculation et cardio'),
('Musculation + Cardio + Crossfit', NULL, 'Adulte', 150, 'Pack complet fitness');

-- Insérer les offres spécifiques femmes
INSERT INTO public.offres (nom, coach, categorie, prix, description) VALUES
('AeroFit 100% femme', NULL, 'Femme', 70, 'Cours de fitness exclusivement féminin'),
('BodyFight', NULL, 'Femme', 75, 'Cours de combat adapté aux femmes'),
('GX Femme', NULL, 'Femme', 65, 'Cours collectifs pour femmes'),
('Danse Orientale', NULL, 'Femme', 60, 'Cours de danse traditionnelle');

-- Ajouter une colonne pour l'état de santé dans les tables d'inscriptions enfants
ALTER TABLE public.inscriptions_enfants ADD COLUMN etat_sante text;

-- Ajouter les colonnes prix_total pour toutes les tables d'inscriptions
ALTER TABLE public.inscriptions_enfants ADD COLUMN prix_total numeric DEFAULT 0;
ALTER TABLE public.inscriptions_adultes ADD COLUMN prix_total numeric DEFAULT 0;
ALTER TABLE public.inscriptions_femmes ADD COLUMN prix_total numeric DEFAULT 0;