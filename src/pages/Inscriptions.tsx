import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, Edit, Trash2, MoreHorizontal, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import InscriptionForm from "@/components/InscriptionForm";
import ProlongationModal from "@/components/ProlongationModal";

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
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedSpecialite, setSelectedSpecialite] = useState("Toutes");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInscription, setEditingInscription] = useState<Inscription | null>(null);
  const [prolongationInscription, setProlongationInscription] = useState<Inscription | null>(null);
  const [isProlongationModalOpen, setIsProlongationModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInscriptions();
    
    // Gérer les filtres depuis l'URL
    const filterParam = searchParams.get('filter');
    if (filterParam === 'expired') {
      setSelectedStatus('Expirée');
    } else if (filterParam === 'expiring') {
      setSelectedStatus('Expire bientôt');
    }
  }, [searchParams]);

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

  const handleAddNew = () => {
    setEditingInscription(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (inscription: Inscription) => {
    setEditingInscription(inscription);
    setIsDialogOpen(true);
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

  const handleProlonger = (inscription: Inscription) => {
    setProlongationInscription(inscription);
    setIsProlongationModalOpen(true);
  };

  const handleProlongationSuccess = () => {
    fetchInscriptions();
    setIsProlongationModalOpen(false);
    setProlongationInscription(null);
  };

  const categories = ["Tous", "Femme", "Enfant", "Adulte"];
  const statuses = ["Tous", "Active", "Expire bientôt", "Expirée"];
  
  // Get unique specialties for dropdown
  const specialites = ["Toutes", ...Array.from(new Set(inscriptions.map(inscription => inscription.specialite)))];

  // Helper function to get inscription status
  const getInscriptionStatus = (dateFin: string) => {
    const today = new Date();
    const endDate = new Date(dateFin);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Expirée";
    } else if (diffDays <= 7) {
      return "Expire bientôt";
    } else {
      return "Active";
    }
  };

  const filteredInscriptions = inscriptions.filter(inscription => {
    const matchesSearch = inscription.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.telephone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || inscription.categorie === selectedCategory;
    const matchesSpecialite = selectedSpecialite === "Toutes" || inscription.specialite === selectedSpecialite;
    const inscriptionStatus = getInscriptionStatus(inscription.date_fin);
    const matchesStatus = selectedStatus === "Tous" || inscriptionStatus === selectedStatus;
    return matchesSearch && matchesCategory && matchesSpecialite && matchesStatus;
  });

  const getStatusBadge = (dateFin: string) => {
    const today = new Date();
    const endDate = new Date(dateFin);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge variant="destructive">Expirée</Badge>;
    } else if (diffDays <= 7) {
      return <Badge className="bg-orange-500 text-white">Expire bientôt</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
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
        <Button 
          onClick={handleAddNew}
          className="bg-gym-yellow text-black hover:bg-gym-yellow/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une inscription
        </Button>
      </div>

      {/* Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <InscriptionForm 
            onSuccess={handleFormSuccess} 
            editingInscription={editingInscription}
          />
        </DialogContent>
      </Dialog>

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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSpecialite} onValueChange={setSelectedSpecialite}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  {specialites.map((specialite) => (
                    <SelectItem key={specialite} value={specialite}>
                      {specialite}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                     <td className="p-3">{inscription.prix_total} DT</td>
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
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="outline" size="sm">
                               <MoreHorizontal className="w-4 h-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handleProlonger(inscription)}>
                               <Clock className="w-4 h-4 mr-2" />
                               Prolonger
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                               onClick={() => handleDelete(inscription)}
                               className="text-destructive focus:text-destructive"
                             >
                               <Trash2 className="w-4 h-4 mr-2" />
                               Supprimer
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Prolongation Modal */}
      <ProlongationModal
        inscription={prolongationInscription}
        isOpen={isProlongationModalOpen}
        onClose={() => setIsProlongationModalOpen(false)}
        onSuccess={handleProlongationSuccess}
      />
    </div>
  );
}
