import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InscriptionDetailModal } from "@/components/InscriptionDetailModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Inscription {
  id: string;
  nom: string;
  prenom: string;
  age: number | null;
  telephone: string;
  specialite: string;
  date_debut: string;
  date_fin: string;
  duree_abonnement: string;
  prix_total: number;
  categorie: string;
}

export default function Dashboard() {
  const [totalInscriptions, setTotalInscriptions] = useState(0);
  const [activeInscriptions, setActiveInscriptions] = useState(0);
  const [expiredInscriptions, setExpiredInscriptions] = useState(0);
  const [inscriptionsData, setInscriptionsData] = useState<Inscription[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      const [enfantsData, adultesData, femmesData] = await Promise.all([
        supabase.from('inscriptions_enfants').select('*'),
        supabase.from('inscriptions_adultes').select('*'),
        supabase.from('inscriptions_femmes').select('*')
      ]);

      const allInscriptions: Inscription[] = [
        ...(enfantsData.data || []).map(item => ({ ...item, categorie: 'Enfant' })),
        ...(adultesData.data || []).map(item => ({ ...item, categorie: 'Adulte' })),
        ...(femmesData.data || []).map(item => ({ ...item, categorie: 'Femme' }))
      ];

      setInscriptionsData(allInscriptions);
      setTotalInscriptions(allInscriptions.length);

      const today = new Date();
      const active = allInscriptions.filter(inscription => new Date(inscription.date_fin) >= today).length;
      setActiveInscriptions(active);

      const expired = allInscriptions.filter(inscription => new Date(inscription.date_fin) < today).length;
      setExpiredInscriptions(expired);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les inscriptions",
        variant: "destructive"
      });
    }
  };

  const categoryData = inscriptionsData.reduce((acc: { [key: string]: number }, inscription) => {
    const category = inscription.categorie;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(categoryData).map(category => ({
    name: category,
    count: categoryData[category],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Aperçu des statistiques et des données importantes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Inscriptions" value={totalInscriptions.toString()} />
        <MetricCard title="Inscriptions Actives" value={activeInscriptions.toString()} />
        <MetricCard title="Inscriptions Expirées" value={expiredInscriptions.toString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Répartition par Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <InscriptionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        inscription={selectedInscription}
        onEdit={(inscription) => {
          toast({
            title: "Redirection",
            description: "Veuillez aller à la page Inscriptions pour modifier cette inscription"
          });
          setIsDetailModalOpen(false);
        }}
        onProlonger={(inscription) => {
          toast({
            title: "Redirection", 
            description: "Veuillez aller à la page Inscriptions pour prolonger cette inscription"
          });
          setIsDetailModalOpen(false);
        }}
        onDelete={(inscription) => {
          toast({
            title: "Redirection",
            description: "Veuillez aller à la page Inscriptions pour supprimer cette inscription"
          });
          setIsDetailModalOpen(false);
        }}
      />
    </div>
  );
}
