import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";

export default function Offres() {
  // Mock data for demonstration
  const [offres] = useState([
    {
      id: 1,
      nom: "Pack Fitness",
      coach: "Sarah Martin",
      categorie: "Femme",
      prix: 45.00,
      description: "Programme complet de fitness avec cours collectifs"
    },
    {
      id: 2,
      nom: "Musculation Premium",
      coach: "Jean Dupont",
      categorie: "Adulte",
      prix: 65.00,
      description: "Accès illimité à la salle de musculation avec coaching personnalisé"
    },
    {
      id: 3,
      nom: "Natation Enfants",
      coach: "Marie Leblanc",
      categorie: "Enfant",
      prix: 35.00,
      description: "Cours de natation adaptés aux enfants de 6 à 16 ans"
    },
    {
      id: 4,
      nom: "CrossFit Intensif",
      coach: "Marc Rodriguez",
      categorie: "Mixte",
      prix: 55.00,
      description: "Programme CrossFit pour tous niveaux"
    },
    {
      id: 5,
      nom: "Yoga & Détente",
      coach: "Sophie Chen",
      categorie: "Femme",
      prix: 40.00,
      description: "Cours de yoga et méditation pour la détente"
    },
    {
      id: 6,
      nom: "Cardio Training",
      coach: null,
      categorie: "Mixte",
      prix: 30.00,
      description: "Accès libre aux équipements de cardio-training"
    }
  ]);

  const getCategoryBadge = (categorie: string) => {
    const colors = {
      "Femme": "bg-pink-100 text-pink-800",
      "Enfant": "bg-blue-100 text-blue-800",
      "Adulte": "bg-green-100 text-green-800",
      "Mixte": "bg-purple-100 text-purple-800"
    };
    return (
      <Badge className={colors[categorie as keyof typeof colors]}>
        {categorie}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offres</h1>
          <p className="text-muted-foreground">
            Gérez les offres et services de votre salle de sport
          </p>
        </div>
        <Button className="bg-gym-yellow text-black hover:bg-gym-yellow/90">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une offre
        </Button>
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
              {(offres.reduce((sum, offre) => sum + offre.prix, 0) / offres.length).toFixed(0)} €
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
              {Math.max(...offres.map(offre => offre.prix))} €
            </div>
          </CardContent>
        </Card>
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
                  {offre.prix.toFixed(2)} €
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
                {offre.description}
              </p>

              <div className="flex justify-between space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Offer Card */}
      <Card className="border-dashed border-2 hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Plus className="w-12 h-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-medium">Ajouter une nouvelle offre</h3>
            <p className="text-sm text-muted-foreground">
              Créez une nouvelle offre pour vos clients
            </p>
          </div>
          <Button className="bg-gym-yellow text-black hover:bg-gym-yellow/90">
            Commencer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}