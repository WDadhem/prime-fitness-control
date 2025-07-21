import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserX, Clock, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  // Mock data for demonstration
  const stats = {
    totalInscriptions: {
      femmes: 45,
      enfants: 32,
      adultes: 67,
      total: 144
    },
    inscriptionsExpirees: 12,
    expirationProche: 8,
    revenus: 15420
  };

  const pieData = [
    { name: "Femmes", value: stats.totalInscriptions.femmes, color: "hsl(var(--chart-1))" },
    { name: "Enfants", value: stats.totalInscriptions.enfants, color: "hsl(var(--chart-2))" },
    { name: "Adultes", value: stats.totalInscriptions.adultes, color: "hsl(var(--chart-3))" },
  ];

  const barData = [
    { mois: "Jan", revenus: 12000 },
    { mois: "Fév", revenus: 14500 },
    { mois: "Mar", revenus: 13200 },
    { mois: "Avr", revenus: 15420 },
    { mois: "Mai", revenus: 16800 },
    { mois: "Juin", revenus: 18200 },
  ];

  const dernieresInscriptions = [
    { nom: "Dupont", prenom: "Marie", categorie: "Femme", date: "2024-01-15", offre: "Fitness" },
    { nom: "Martin", prenom: "Pierre", categorie: "Adulte", date: "2024-01-14", offre: "Musculation" },
    { nom: "Dubois", prenom: "Sophie", categorie: "Enfant", date: "2024-01-13", offre: "Natation" },
    { nom: "Moreau", prenom: "Jean", categorie: "Adulte", date: "2024-01-12", offre: "CrossFit" },
    { nom: "Leroy", prenom: "Emma", categorie: "Femme", date: "2024-01-11", offre: "Yoga" },
  ];

  const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre salle de sport
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inscriptions"
          value={stats.totalInscriptions.total}
          icon={Users}
          description={`${stats.totalInscriptions.femmes} femmes, ${stats.totalInscriptions.enfants} enfants, ${stats.totalInscriptions.adultes} adultes`}
        />
        <StatCard
          title="Inscriptions Expirées"
          value={stats.inscriptionsExpirees}
          icon={UserX}
          description="Nécessitent un renouvellement"
        />
        <StatCard
          title="Expiration Proche"
          value={stats.expirationProche}
          icon={Clock}
          description="Moins de 7 jours"
        />
        <StatCard
          title="Revenus Totaux"
          value={`${stats.revenus.toLocaleString()} €`}
          icon={DollarSign}
          description="Ce mois-ci"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenus Mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} €`, "Revenus"]} />
                <Bar dataKey="revenus" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Inscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>5 Dernières Inscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nom</th>
                  <th className="text-left p-2">Prénom</th>
                  <th className="text-left p-2">Catégorie</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Offre</th>
                </tr>
              </thead>
              <tbody>
                {dernieresInscriptions.map((inscription, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{inscription.nom}</td>
                    <td className="p-2">{inscription.prenom}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        inscription.categorie === 'Femme' ? 'bg-pink-100 text-pink-800' :
                        inscription.categorie === 'Enfant' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {inscription.categorie}
                      </span>
                    </td>
                    <td className="p-2">{inscription.date}</td>
                    <td className="p-2">{inscription.offre}</td>
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