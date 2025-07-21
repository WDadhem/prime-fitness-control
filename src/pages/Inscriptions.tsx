import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";

export default function Inscriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  // Mock data for demonstration
  const inscriptions = [
    { 
      id: 1, 
      nom: "Dupont", 
      prenom: "Marie", 
      age: 28, 
      telephone: "06.12.34.56.78", 
      categorie: "Femme", 
      specialite: "Fitness",
      dateDebut: "2024-01-15",
      dateFin: "2024-04-15",
      duree: "3 mois",
      offre: "Pack Fitness",
      statut: "active"
    },
    { 
      id: 2, 
      nom: "Martin", 
      prenom: "Pierre", 
      age: 35, 
      telephone: "06.23.45.67.89", 
      categorie: "Adulte", 
      specialite: "Musculation",
      dateDebut: "2024-01-10",
      dateFin: "2024-07-10",
      duree: "6 mois",
      offre: "Pack Musculation",
      statut: "active"
    },
    { 
      id: 3, 
      nom: "Dubois", 
      prenom: "Sophie", 
      age: 12, 
      telephone: "06.34.56.78.90", 
      categorie: "Enfant", 
      specialite: "Natation",
      dateDebut: "2023-12-01",
      dateFin: "2024-01-01",
      duree: "1 mois",
      offre: "Cours Natation",
      statut: "expired"
    },
    { 
      id: 4, 
      nom: "Moreau", 
      prenom: "Jean", 
      age: 42, 
      telephone: "06.45.67.89.01", 
      categorie: "Adulte", 
      specialite: "CrossFit",
      dateDebut: "2024-01-05",
      dateFin: "2024-01-25",
      duree: "1 mois",
      offre: "Pack CrossFit",
      statut: "expiring"
    },
  ];

  const categories = ["Tous", "Femme", "Enfant", "Adulte"];

  const filteredInscriptions = inscriptions.filter(inscription => {
    const matchesSearch = inscription.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inscription.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || inscription.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "active":
        return <Badge className="bg-gym-success text-white">Active</Badge>;
      case "expired":
        return <Badge variant="destructive">Expirée</Badge>;
      case "expiring":
        return <Badge className="bg-gym-warning text-white">Expire bientôt</Badge>;
      default:
        return <Badge variant="secondary">Inconnue</Badge>;
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
        <Button className="bg-gym-yellow text-black hover:bg-gym-yellow/90">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une inscription
        </Button>
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
                  placeholder="Rechercher par nom ou prénom..."
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
                  <th className="text-left p-3">Offre</th>
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
                        <div>Du {inscription.dateDebut}</div>
                        <div>Au {inscription.dateFin}</div>
                        <div className="text-muted-foreground">({inscription.duree})</div>
                      </div>
                    </td>
                    <td className="p-3">{inscription.offre}</td>
                    <td className="p-3">
                      {getStatusBadge(inscription.statut)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          Renouveler
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