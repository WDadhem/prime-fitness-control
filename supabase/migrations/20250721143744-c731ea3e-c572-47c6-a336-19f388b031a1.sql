-- Supprimer toutes les offres existantes
DELETE FROM public.offres;

-- Insérer les vraies offres pour enfants avec les nouveaux prix
INSERT INTO public.offres (nom, coach, categorie, prix, description) VALUES
('Karate Kyokushinkai', 'Nizar Chikh Brahim', 'Enfant', 60, 'Art martial traditionnel japonais'),
('Karate Shotokan', 'Souhaiel Ben Hessine', 'Enfant', 60, 'Art martial traditionnel japonais'),
('Gymnastique', 'Wassel Hajjem', 'Enfant', 50, 'Développement de la souplesse et coordination'),
('Kick Boxing', 'Hani El Mechi', 'Enfant', 70, 'Sports de combat moderne'),
('Taekwondo', 'Chokri Mabrouk', 'Enfant', 60, 'Art martial coréen');

-- Insérer les offres pour adultes (hommes et femmes) avec les nouveaux prix
INSERT INTO public.offres (nom, coach, categorie, prix, description) VALUES
('Kick Boxing', NULL, 'Adulte', 80, 'Sports de combat pour adultes'),
('Musculation', NULL, 'Adulte', 70, 'Renforcement musculaire'),
('Crossfit', NULL, 'Adulte', 90, 'Entraînement fonctionnel haute intensité'),
('Musculation + Crossfit', NULL, 'Adulte', 140, 'Combinaison musculation et crossfit'),
('Musculation + Cardio', NULL, 'Adulte', 110, 'Combinaison musculation et cardio'),
('Musculation + Cardio + Crossfit', NULL, 'Adulte', 160, 'Pack complet fitness');

-- Insérer les offres spécifiques femmes avec les nouveaux prix
INSERT INTO public.offres (nom, coach, categorie, prix, description) VALUES
('AeroFit 100% femme', NULL, 'Femme', 75, 'Cours de fitness exclusivement féminin'),
('BodyFight', NULL, 'Femme', 80, 'Cours de combat adapté aux femmes'),
('GX Femme', NULL, 'Femme', 70, 'Cours collectifs pour femmes'),
('Danse Orientale', NULL, 'Femme', 60, 'Cours de danse traditionnelle');