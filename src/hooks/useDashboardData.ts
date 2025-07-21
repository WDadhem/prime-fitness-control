import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardData = () => {
  // Récupérer toutes les inscriptions
  const { data: inscriptionsAdultes = [] } = useQuery({
    queryKey: ["inscriptions_adultes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inscriptions_adultes")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: inscriptionsEnfants = [] } = useQuery({
    queryKey: ["inscriptions_enfants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inscriptions_enfants")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: inscriptionsFemmes = [] } = useQuery({
    queryKey: ["inscriptions_femmes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inscriptions_femmes")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: offres = [] } = useQuery({
    queryKey: ["offres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offres")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculer les statistiques
  const stats = {
    totalInscriptions: {
      femmes: inscriptionsFemmes.length,
      enfants: inscriptionsEnfants.length,
      adultes: inscriptionsAdultes.length,
      total: inscriptionsAdultes.length + inscriptionsEnfants.length + inscriptionsFemmes.length,
    },
    inscriptionsExpirees: 0,
    expirationProche: 0,
    revenus: 0,
  };

  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Calculer les expirations
  const allInscriptions = [
    ...inscriptionsAdultes.map(i => ({ ...i, type: 'adulte' })),
    ...inscriptionsEnfants.map(i => ({ ...i, type: 'enfant' })),
    ...inscriptionsFemmes.map(i => ({ ...i, type: 'femme' })),
  ];

  allInscriptions.forEach(inscription => {
    const dateFin = new Date(inscription.date_fin);
    if (dateFin < today) {
      stats.inscriptionsExpirees++;
    } else if (dateFin <= sevenDaysFromNow) {
      stats.expirationProche++;
    }
    stats.revenus += inscription.prix_total || 0;
  });

  // Données pour le graphique en secteurs
  const pieData = [
    { name: "Femmes", value: stats.totalInscriptions.femmes, color: "hsl(var(--chart-1))" },
    { name: "Enfants", value: stats.totalInscriptions.enfants, color: "hsl(var(--chart-2))" },
    { name: "Adultes", value: stats.totalInscriptions.adultes, color: "hsl(var(--chart-3))" },
  ];

  // Données pour le graphique en barres (revenus par mois)
  const monthlyRevenues = new Map();
  allInscriptions.forEach(inscription => {
    const month = new Date(inscription.date_debut).getMonth();
    const year = new Date(inscription.date_debut).getFullYear();
    const key = `${year}-${month}`;
    
    if (!monthlyRevenues.has(key)) {
      monthlyRevenues.set(key, 0);
    }
    monthlyRevenues.set(key, monthlyRevenues.get(key) + (inscription.prix_total || 0));
  });

  const barData = Array.from(monthlyRevenues.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Prendre les 6 derniers mois
    .map(([key, revenus]) => {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      return {
        mois: monthNames[parseInt(month)],
        revenus: revenus,
      };
    });

  // 5 dernières inscriptions
  const dernieresInscriptions = allInscriptions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(inscription => ({
      nom: inscription.nom,
      prenom: inscription.prenom,
      categorie: inscription.type === 'adulte' ? 'Adulte' : inscription.type === 'enfant' ? 'Enfant' : 'Femme',
      date: new Date(inscription.created_at).toLocaleDateString('fr-FR'),
      offre: inscription.specialite,
    }));

  return {
    stats,
    pieData,
    barData,
    dernieresInscriptions,
    isLoading: false, // Vous pouvez ajouter une logique de loading si nécessaire
  };
};