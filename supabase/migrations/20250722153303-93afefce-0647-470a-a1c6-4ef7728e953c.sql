-- Insérer un admin par défaut
INSERT INTO public.admins (user_id, nom, prenom, email) 
VALUES (
  gen_random_uuid(),
  'Admin', 
  'Oxygène', 
  'admin@oxygene.djerba'
);