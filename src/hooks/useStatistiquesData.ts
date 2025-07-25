import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStatistiquesData = () => {
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

  // Combiner toutes les inscriptions
  const allInscriptions = [
    ...inscriptionsAdultes.map(i => ({ ...i, type: 'adulte' })),
    ...inscriptionsEnfants.map(i => ({ ...i, type: 'enfant' })),
    ...inscriptionsFemmes.map(i => ({ ...i, type: 'femme' })),
  ];

  // Calculer les données pour les graphiques
  const revenusData = (() => {
    const monthlyData = new Map();
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    allInscriptions.forEach(inscription => {
      const date = new Date(inscription.date_debut);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      
      if (!monthlyData.has(key)) {
        monthlyData.set(key, { revenus: 0, inscriptions: 0 });
      }
      
      const current = monthlyData.get(key);
      current.revenus += inscription.prix_total || 0;
      current.inscriptions += 1;
    });

    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Prendre les 6 derniers mois
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        return {
          mois: monthNames[parseInt(month)],
          revenus: data.revenus,
          inscriptions: data.inscriptions,
        };
      });
  })();

  // Répartition par catégorie
  const categoriesData = [
    { name: "Femmes", value: inscriptionsFemmes.length, color: "hsl(var(--chart-1))" },
    { name: "Enfants", value: inscriptionsEnfants.length, color: "hsl(var(--chart-2))" },
    { name: "Adultes", value: inscriptionsAdultes.length, color: "hsl(var(--chart-3))" },
  ];

  // Statistiques corrigées par coach (basées sur les spécialités)
  const coachStats = (() => {
    const specialiteStats = new Map();
    
    allInscriptions.forEach(inscription => {
      const specialite = inscription.specialite;
      if (!specialiteStats.has(specialite)) {
        specialiteStats.set(specialite, { clients: 0, revenus: 0 });
      }
      
      const current = specialiteStats.get(specialite);
      current.clients += 1;
      current.revenus += inscription.prix_total || 0;
    });

    return Array.from(specialiteStats.entries()).map(([specialite, stats]) => ({
      coach: `Coach ${specialite}`,
      clients: stats.clients,
      revenus: stats.revenus,
      specialite: specialite,
      moyenneParClient: stats.clients > 0 ? (stats.revenus / stats.clients) : 0,
    }));
  })();

  // Nouvelles statistiques par spécialité
  const specialiteStats = (() => {
    const stats = new Map();
    
    allInscriptions.forEach(inscription => {
      const specialite = inscription.specialite;
      if (!stats.has(specialite)) {
        stats.set(specialite, { 
          clients: 0, 
          revenus: 0,
          femmes: 0,
          enfants: 0,
          adultes: 0
        });
      }
      
      const current = stats.get(specialite);
      current.clients += 1;
      current.revenus += inscription.prix_total || 0;
      
      if (inscription.type === 'femme') current.femmes += 1;
      else if (inscription.type === 'enfant') current.enfants += 1;
      else if (inscription.type === 'adulte') current.adultes += 1;
    });

    return Array.from(stats.entries()).map(([specialite, data]) => ({
      specialite,
      clients: data.clients,
      revenus: data.revenus,
      femmes: data.femmes,
      enfants: data.enfants,
      adultes: data.adultes,
      moyenneParClient: data.clients > 0 ? (data.revenus / data.clients) : 0,
    }));
  })();

  // Gestion des expirations
  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const clientsExpires = allInscriptions
    .filter(inscription => new Date(inscription.date_fin) < today)
    .map(inscription => ({
      nom: inscription.nom,
      prenom: inscription.prenom,
      categorie: inscription.type === 'adulte' ? 'Adulte' : inscription.type === 'enfant' ? 'Enfant' : 'Femme',
      dateFin: new Date(inscription.date_fin).toLocaleDateString('fr-FR'),
      joursRestants: Math.floor((new Date(inscription.date_fin).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    }));

  const clientsExpirationProche = allInscriptions
    .filter(inscription => {
      const dateFin = new Date(inscription.date_fin);
      return dateFin >= today && dateFin <= sevenDaysFromNow;
    })
    .map(inscription => ({
      nom: inscription.nom,
      prenom: inscription.prenom,
      categorie: inscription.type === 'adulte' ? 'Adulte' : inscription.type === 'enfant' ? 'Enfant' : 'Femme',
      dateFin: new Date(inscription.date_fin).toLocaleDateString('fr-FR'),
      joursRestants: Math.floor((new Date(inscription.date_fin).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    }));

  // Calculs des totaux
  const totalClients = categoriesData.reduce((sum, cat) => sum + cat.value, 0);
  const totalRevenus = revenusData.reduce((sum, month) => sum + month.revenus, 0);
  const moyenneRevenus = revenusData.length > 0 ? totalRevenus / revenusData.length : 0;

  return {
    revenusData,
    categoriesData,
    coachStats,
    specialiteStats,
    clientsExpires,
    clientsExpirationProche,
    totalClients,
    totalRevenus,
    moyenneRevenus,
    isLoading: false,
  };
};
