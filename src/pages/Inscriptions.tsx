import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Filter, Edit, Trash2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import InscriptionForm from "@/components/InscriptionForm";

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

export default function Inscriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInscription, setEditingInscription] = useState<Inscription | null>(null);
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

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingInscription(null);
    fetchInscriptions();
  };

  const handleEdit = (inscription: Inscription) => {
    setEditingInscription(inscription);
    setIsDialogOpen(true);
  };

  const handleRenew = async (inscription: Inscription) => {
    try {
      const newStartDate = new Date(inscription.date_fin);
      newStartDate.setDate(newStartDate.getDate() + 1);
      
      const newEndDate = new Date(newStartDate);
      const dureeEnMois = parseInt(inscription.duree_abonnement.split(' ')[0]);
      newEndDate.setMonth(newEndDate.getMonth() + dureeEnMois);

      const renewalData = {
        nom: inscription.nom,
        prenom: inscription.prenom,
        age: inscription.age,
        telephone: inscription.telephone,
        specialite: inscription.specialite,
        date_debut: newStartDate.toISOString().split('T')[0],
        date_fin: newEndDate.toISOString().split('T')[0],
        duree_abonnement: inscription.duree_abonnement,
        prix_total: inscription.prix_total
      };

      let error;
      if (inscription.categorie === 'Enfant') {
        const { error: insertError } = await supabase
          .from('inscriptions_enfants')
          .insert([renewalData]);
        error = insertError;
      } else if (inscription.categorie === 'Adulte') {
        const { error: insertError } = await supabase
          .from('inscriptions_adultes')
          .insert([renewalData]);
        error = insertError;
      } else if (inscription.categorie === 'Femme') {
        const { error: insertError } = await supabase
          .from('inscriptions_femmes')
          .insert([renewalData]);
        error = insertError;
      }

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de renouveler l'inscription",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Inscription renouvelée avec succès"
      });
      
      fetchInscriptions();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du renouvellement",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (inscription: Inscription) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'inscription de ${inscription.nom} ${inscription.prenom} ?`)) {
      return;
    }

    try {
      let error;
      if (inscription.categorie === 'Enfant') {
        const { error: deleteError } = await supabase
          .from('inscriptions_enfants')
          .delete()
          .eq('id', inscription.id);
        error = deleteError;
      } else if (inscription.categorie === 'Adulte') {
        const { error: deleteError } = await supabase
          .from('inscriptions_adultes')
          .delete()
          .eq('id', inscription.id);
        error = deleteError;
      } else if (inscription.categorie === 'Femme') {
        const { error: deleteError } = await supabase
          .from('inscriptions_femmes')
          .delete()
          .eq('id', inscription.id);
        error = deleteError;
      }

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'inscription",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Inscription supprimée avec succès"
      });
      
      fetchInscriptions();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const categories = ["Tous", "Femme", "Enfant", "Adulte"];

  const filteredInscriptions = inscriptions.filter(inscription => {
    const matchesSearch = inscription.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.telephone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || inscription.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (dateFin: string) => {
    const today = new Date();
    const endDate = new Date(dateFin);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge variant="destructive">Expirée</Badge>;
    } else if (diffDays <= 7) {
      return <Badge className="bg-gym-warning text-white">Expire bientôt</Badge>;
    } else {
      return <Badge className="bg-gym-success text-white">Active</Badge>;
    }
  };

  const getCategoryBadge = (categorie: string) => {
    const colors = {
      "Femme": "bg-pink-100 text-pink-800",
      "Enfant": "bg-blue-100 text-blue-800",
      "Adulte": "bg-green-100 text-green-800"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[categorie as keyof typeof colors]}`}>
        {categorie}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inscriptions</h1>
          <p className="text-muted-foreground">
            Gérez les inscriptions de vos clients
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gym-yellow text-black hover:bg-gym-yellow/90">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une inscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <InscriptionForm 
              onSuccess={handleFormSuccess} 
              editingInscription={editingInscription}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, prénom, spécialité ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Filter className="h-4 w-4 mt-3 text-muted-foreground" />
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des Inscriptions ({filteredInscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Client</th>
                  <th className="text-left p-3">Contact</th>
                  <th className="text-left p-3">Catégorie</th>
                  <th className="text-left p-3">Spécialité</th>
                  <th className="text-left p-3">Période</th>
                  <th className="text-left p-3">Prix</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInscriptions.map((inscription) => (
                  <tr key={inscription.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{inscription.nom} {inscription.prenom}</div>
                        <div className="text-sm text-muted-foreground">{inscription.age} ans</div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{inscription.telephone}</td>
                    <td className="p-3">
                      {getCategoryBadge(inscription.categorie)}
                    </td>
                    <td className="p-3">{inscription.specialite}</td>
                     <td className="p-3">
                       <div className="text-sm">
                         <div>Du {inscription.date_debut}</div>
                         <div>Au {inscription.date_fin}</div>
                         <div className="text-muted-foreground">({inscription.duree_abonnement})</div>
                       </div>
                     </td>
                     <td className="p-3">{inscription.prix_total}€</td>
                     <td className="p-3">
                       {getStatusBadge(inscription.date_fin)}
                     </td>
                     <td className="p-3">
                       <div className="flex gap-1">
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleEdit(inscription)}
                         >
                           <Edit className="w-4 h-4 mr-1" />
                           Modifier
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleRenew(inscription)}
                         >
                           <RotateCcw className="w-4 h-4 mr-1" />
                           Renouveler
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm"
                           className="text-destructive hover:text-destructive"
                           onClick={() => handleDelete(inscription)}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}