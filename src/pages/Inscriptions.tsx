import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Inscription {
  id: string;
  nom: string;
  prenom: string;
  age?: number;
  telephone: string;
  specialite: string;
  date_debut: string;
  date_fin: string;
  duree_abonnement: string;
  prix_total: number;
  categorie: string;
  etat_sante?: string;
}

export default function Inscriptions() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedSpecialite, setSelectedSpecialite] = useState("Toutes");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [filteredInscriptions, setFilteredInscriptions] = useState<Inscription[]>([]);
  const [specialites, setSpecialites] = useState<string[]>([]);
  const [offres, setOffres] = useState<any[]>([]);

  useEffect(() => {
    fetchInscriptions();
    fetchOffres();
    
    // Gérer les filtres depuis l'URL
    const filterParam = searchParams.get('filter');
    if (filterParam === 'expired') {
      setSelectedStatus('Expirée');
    } else if (filterParam === 'expiring') {
      setSelectedStatus('Expire bientôt');
    }
  }, [searchParams]);

  const fetchOffres = async () => {
    try {
      const { data, error } = await supabase
        .from("offres")
        .select("*");
      
      if (error) throw error;
      setOffres(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des offres:", error);
    }
  };

  const fetchInscriptions = async () => {
    try {
      const { data: adultes, error: errorAdultes } = await supabase
        .from("inscriptions_adultes")
        .select("*");

      const { data: enfants, error: errorEnfants } = await supabase
        .from("inscriptions_enfants")
        .select("*");

      const { data: femmes, error: errorFemmes } = await supabase
        .from("inscriptions_femmes")
        .select("*");

      if (errorAdultes) throw errorAdultes;
      if (errorEnfants) throw errorEnfants;
      if (errorFemmes) throw errorFemmes;

      const allInscriptions = [
        ...adultes.map(i => ({ ...i, categorie: 'Adulte' })),
        ...enfants.map(i => ({ ...i, categorie: 'Enfant' })),
        ...femmes.map(i => ({ ...i, categorie: 'Femme' })),
      ];

      setInscriptions(allInscriptions);
      
      // Extract unique specialites
      const uniqueSpecialites = [...new Set(allInscriptions.map(i => i.specialite))];
      setSpecialites(uniqueSpecialites);
    } catch (error) {
      console.error("Erreur lors de la récupération des inscriptions:", error);
    }
  };

  useEffect(() => {
    let filtered = [...inscriptions];

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(inscription =>
        inscription.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inscription.prenom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par catégorie
    if (selectedCategory !== "Tous") {
      filtered = filtered.filter(inscription => inscription.categorie === selectedCategory);
    }

    // Filtrer par spécialité
    if (selectedSpecialite !== "Toutes") {
      filtered = filtered.filter(inscription => inscription.specialite === selectedSpecialite);
    }

    // Filtrer par statut
    if (selectedStatus !== "Tous") {
      filtered = filtered.filter(inscription => {
        const today = new Date();
        const finDate = new Date(inscription.date_fin);
        const diffTime = finDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (selectedStatus === "Active") {
          return diffDays >= 7;
        } else if (selectedStatus === "Expire bientôt") {
          return diffDays > 0 && diffDays < 7;
        } else if (selectedStatus === "Expirée") {
          return diffDays <= 0;
        }
        return true;
      });
    }

    setFilteredInscriptions(filtered);
  }, [inscriptions, searchTerm, selectedCategory, selectedSpecialite, selectedStatus]);

  const deleteInscription = async (id: string, categorie: string) => {
    try {
      let table = "";
      if (categorie === "Adulte") {
        table = "inscriptions_adultes";
      } else if (categorie === "Enfant") {
        table = "inscriptions_enfants";
      } else {
        table = "inscriptions_femmes";
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Refresh inscriptions after deletion
      fetchInscriptions();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'inscription:", error);
    }
  };

  const getStatusBadge = (dateFin: string) => {
    const today = new Date();
    const finDate = new Date(dateFin);
    const diffTime = finDate.getTime() - today.getTime();
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
      <Badge className={colors[categorie as keyof typeof colors]}>
        {categorie}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inscriptions</h1>
        <p className="text-muted-foreground">
          Gérez toutes les inscriptions de votre salle de sport
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Toutes</SelectItem>
                <SelectItem value="Adulte">Adultes</SelectItem>
                <SelectItem value="Enfant">Enfants</SelectItem>
                <SelectItem value="Femme">Femmes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSpecialite} onValueChange={setSelectedSpecialite}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Spécialité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Toutes">Toutes</SelectItem>
                {specialites.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous</SelectItem>
                <SelectItem value="Active">Actives</SelectItem>
                <SelectItem value="Expire bientôt">Expire bientôt</SelectItem>
                <SelectItem value="Expirée">Expirées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Inscriptions ({filteredInscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Date fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInscriptions.map((inscription) => (
                  <TableRow key={inscription.id}>
                    <TableCell className="font-medium">
                      {inscription.prenom} {inscription.nom}
                      {inscription.age && <span className="text-muted-foreground ml-1">({inscription.age} ans)</span>}
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(inscription.categorie)}
                    </TableCell>
                    <TableCell>{inscription.specialite}</TableCell>
                    <TableCell>{inscription.telephone}</TableCell>
                    <TableCell>{new Date(inscription.date_fin).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      {getStatusBadge(inscription.date_fin)}
                    </TableCell>
                    <TableCell className="font-medium">{inscription.prix_total} DT</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteInscription(inscription.id, inscription.categorie)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
