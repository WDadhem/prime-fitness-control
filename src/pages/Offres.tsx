
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Offre {
  id: string;
  nom: string;
  coach: string | null;
  categorie: string;
  prix: number;
  description: string | null;
}

interface FormData {
  nom: string;
  coach: string;
  categorie: string;
  prix: string;
  description: string;
}

export default function Offres() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    coach: "",
    categorie: "",
    prix: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOffres();
  }, []);

  const fetchOffres = async () => {
    try {
      setLoading(true);
      console.log("Fetching offres...");
      
      const { data, error } = await supabase
        .from('offres')
        .select('*')
        .order('categorie', { ascending: true });

      console.log("Offres data:", data);
      console.log("Offres error:", error);

      if (error) {
        console.error("Error fetching offres:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les offres: " + error.message,
          variant: "destructive"
        });
        return;
      }

      setOffres(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors du chargement des offres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const offreData = {
      nom: formData.nom,
      coach: formData.coach || null,
      categorie: formData.categorie,
      prix: parseFloat(formData.prix),
      description: formData.description || null
    };

    if (editingOffre) {
      const { error } = await supabase
        .from('offres')
        .update(offreData)
        .eq('id', editingOffre.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier l'offre",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Offre modifiée avec succès"
      });
    } else {
      const { error } = await supabase
        .from('offres')
        .insert([offreData]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'offre",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Offre créée avec succès"
      });
    }

    setIsDialogOpen(false);
    resetForm();
    fetchOffres();
  };

  const handleEdit = (offre: Offre) => {
    setEditingOffre(offre);
    setFormData({
      nom: offre.nom,
      coach: offre.coach || "",
      categorie: offre.categorie,
      prix: offre.prix.toString(),
      description: offre.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      return;
    }

    const { error } = await supabase
      .from('offres')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'offre",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Offre supprimée avec succès"
    });
    
    fetchOffres();
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      coach: "",
      categorie: "",
      prix: "",
      description: ""
    });
    setEditingOffre(null);
  };

  const getCategoryBadge = (categorie: string) => {
    const colors = {
      "Femme": "bg-pink-100 text-pink-800",
      "Enfant": "bg-blue-100 text-blue-800",
      "Adulte": "bg-green-100 text-green-800"
    };
    return (
      <Badge className={colors[categorie as keyof typeof colors]}>
        {categorie}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Chargement des offres...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offres</h1>
          <p className="text-muted-foreground">
            Gérez les offres et services de votre salle de sport
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gym-yellow text-black hover:bg-gym-yellow/90">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une offre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingOffre ? "Modifier l'offre" : "Nouvelle offre"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom de l'offre *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="categorie">Catégorie *</Label>
                <Select 
                  value={formData.categorie} 
                  onValueChange={(value) => setFormData({...formData, categorie: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enfant">Enfant</SelectItem>
                    <SelectItem value="Femme">Femme</SelectItem>
                    <SelectItem value="Adulte">Adulte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prix">Prix (DT) *</Label>
                <Input
                  id="prix"
                  type="number"
                  step="0.01"
                  value={formData.prix}
                  onChange={(e) => setFormData({...formData, prix: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="coach">Coach</Label>
                <Input
                  id="coach"
                  value={formData.coach}
                  onChange={(e) => setFormData({...formData, coach: e.target.value})}
                  placeholder="Nom du coach (optionnel)"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de l'offre (optionnel)"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gym-yellow text-black hover:bg-gym-yellow/90">
                  {editingOffre ? "Modifier" : "Créer"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offres</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offres.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix Moyen</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offres.length > 0 ? (offres.reduce((sum, offre) => sum + offre.prix, 0) / offres.length).toFixed(0) : 0} DT
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avec Coach</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offres.filter(offre => offre.coach).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix Max</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offres.length > 0 ? Math.max(...offres.map(offre => offre.prix)) : 0} DT
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug info */}
      <div className="text-sm text-gray-500">
        Debug: {offres.length} offres chargées
      </div>

      {/* Offres Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {offres.map((offre) => (
          <Card key={offre.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{offre.nom}</CardTitle>
                {getCategoryBadge(offre.categorie)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {offre.prix.toFixed(0)} DT
                </span>
                <span className="text-sm text-muted-foreground">
                  /mois
                </span>
              </div>

              {offre.coach && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Coach:</span>
                  <span className="text-sm text-muted-foreground">{offre.coach}</span>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {offre.description || "Aucune description"}
              </p>

              <div className="flex justify-between space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(offre)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(offre.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {offres.length === 0 && !loading && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Plus className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-medium">Aucune offre trouvée</h3>
              <p className="text-sm text-muted-foreground">
                Commencez par créer votre première offre
              </p>
            </div>
            <Button onClick={fetchOffres} variant="outline">
              Actualiser
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
