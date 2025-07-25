import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Calendar as CalendarDate } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import InscriptionDetailModal from "@/components/InscriptionDetailModal";

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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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

      setInscriptions(allInscriptions);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les inscriptions",
        variant: "destructive"
      });
    }
  };

  const handleInscriptionClick = (inscription: any) => {
    setSelectedInscription(inscription);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalEdit = (inscription: any) => {
    setIsDetailModalOpen(false);
    // For now, we'll just show a toast since editing from dashboard isn't implemented
    toast({
      title: "Redirection",
      description: "Veuillez aller à la page Inscriptions pour modifier cette inscription"
    });
  };

  const handleDetailModalProlonger = (inscription: any) => {
    setIsDetailModalOpen(false);
    // For now, we'll just show a toast since prolonging from dashboard isn't implemented
    toast({
      title: "Redirection",
      description: "Veuillez aller à la page Inscriptions pour prolonger cette inscription"
    });
  };

  const handleDetailModalDelete = (inscription: any) => {
    setIsDetailModalOpen(false);
    // For now, we'll just show a toast since deleting from dashboard isn't implemented
    toast({
      title: "Redirection",
      description: "Veuillez aller à la page Inscriptions pour supprimer cette inscription"
    });
  };

  const filteredInscriptions = inscriptions.filter(inscription => {
    const matchesSearch = inscription.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.telephone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Suivez l'activité récente de votre salle de sport ici.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Inscriptions du jour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">12</p>
            <p className="text-muted-foreground">
              Nombre total d'inscriptions aujourd'hui
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenu mensuel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">2,500 DT</p>
            <p className="text-muted-foreground">
              Revenu total généré ce mois-ci
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nouveaux clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">34</p>
            <p className="text-muted-foreground">
              Nombre de nouveaux clients ce mois-ci
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Abonnements actifs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">150</p>
            <p className="text-muted-foreground">
              Nombre total d'abonnements actifs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
          </CardHeader>
          <CardContent className="border p-3 rounded-md">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarDate
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("2023-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recherche rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une inscription..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="mt-4 space-y-2">
              {filteredInscriptions.map((inscription) => (
                <div 
                  key={inscription.id} 
                  className="border p-3 rounded-md cursor-pointer hover:bg-muted/50"
                  onClick={() => handleInscriptionClick(inscription)}
                >
                  <p className="font-medium">{inscription.nom} {inscription.prenom}</p>
                  <p className="text-sm text-muted-foreground">{inscription.specialite}</p>
                </div>
              ))}
              {filteredInscriptions.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune inscription correspondante.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <InscriptionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        inscription={selectedInscription}
        onEdit={handleDetailModalEdit}
        onProlonger={handleDetailModalProlonger}
        onDelete={handleDetailModalDelete}
      />
    </div>
  );
}
