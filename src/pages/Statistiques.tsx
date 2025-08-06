
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from "recharts";
import { Download, TrendingUp, Users, Clock, DollarSign } from "lucide-react";
import { useStatistiquesData } from "@/hooks/useStatistiquesData";

export default function Statistiques() {
  const [selectedPeriod, setSelectedPeriod] = useState("6-months");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    revenusData,
    categoriesData,
    coachStats,
    specialiteStats,
    clientsExpires,
    clientsExpirationProche,
    totalClients,
    totalRevenus,
    moyenneRevenus,
    isLoading
  } = useStatistiquesData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

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

  const getExpirationBadge = (joursRestants: number) => {
    if (joursRestants < 0) {
      return <Badge variant="destructive">Expiré</Badge>;
    } else if (joursRestants <= 7) {
      return <Badge className="bg-orange-500 text-white">Expire bientôt</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Actif</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-muted-foreground">
          Analyse détaillée des performances de votre salle de sport
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenus.toLocaleString()} DT</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au semestre précédent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne Mensuelle</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moyenneRevenus.toLocaleString()} DT</div>
            <p className="text-xs text-muted-foreground">
              Moyenne sur 6 mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Clients actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirations Proches</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsExpirationProche.length}</div>
            <p className="text-xs text-muted-foreground">
              Dans les 7 prochains jours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenus et Inscriptions Mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => [
                  name === 'revenus' ? `${value} DT` : value,
                  name === 'revenus' ? 'Revenus' : 'Inscriptions'
                ]} />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="revenus" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="inscriptions" 
                  stroke="hsl(var(--gym-yellow))" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Coach Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques par Coach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Coach</th>
                  <th className="text-left p-3">Spécialités</th>
                  <th className="text-left p-3">Clients</th>
                  <th className="text-left p-3">Revenus</th>
                  <th className="text-left p-3">Moyenne/Client</th>
                </tr>
              </thead>
              <tbody>
                {coachStats.map((coach, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{coach.coach}</td>
                    <td className="p-3">{coach.specialites}</td>
                    <td className="p-3">{coach.clients}</td>
                    <td className="p-3">{coach.revenus.toLocaleString()} DT</td>
                    <td className="p-3">{coach.moyenneClient} DT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Specialty Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques par Spécialité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Spécialité</th>
                  <th className="text-left p-3">Clients</th>
                  <th className="text-left p-3">Revenus</th>
                  <th className="text-left p-3">Moyenne/Client</th>
                  <th className="text-left p-3">Femmes</th>
                  <th className="text-left p-3">Enfants</th>
                  <th className="text-left p-3">Adultes</th>
                </tr>
              </thead>
              <tbody>
                {specialiteStats.map((specialite, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{specialite.specialite}</td>
                    <td className="p-3">{specialite.clients}</td>
                    <td className="p-3">{specialite.revenus.toLocaleString()} DT</td>
                    <td className="p-3">{specialite.moyenneClient} DT</td>
                    <td className="p-3">{specialite.femmes}</td>
                    <td className="p-3">{specialite.enfants}</td>
                    <td className="p-3">{specialite.adultes}</td>
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
