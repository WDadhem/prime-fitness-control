import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserX, Clock, DollarSign, AlertTriangle, CalendarX } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { 
    stats, 
    pieData, 
    barData, 
    dernieresInscriptions, 
    inscriptionsExpireesList,
    inscriptionsBientotExpireesList,
    statsExpirees,
    statsBientotExpirees,
    isLoading 
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

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

      {/* Inscriptions Expirées et Bientôt Expirées */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Inscriptions Expirées */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Inscriptions Expirées</CardTitle>
              </div>
              <span className="text-2xl font-bold text-destructive">{statsExpirees.total}</span>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{statsExpirees.femmes} femmes</span>
              <span>{statsExpirees.enfants} enfants</span>
              <span>{statsExpirees.adultes} adultes</span>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Date fin</TableHead>
                  <TableHead>Téléphone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inscriptionsExpireesList.map((inscription, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {inscription.prenom} {inscription.nom}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        inscription.categorie === 'Femme' ? 'bg-pink-100 text-pink-800' :
                        inscription.categorie === 'Enfant' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {inscription.categorie}
                      </span>
                    </TableCell>
                    <TableCell className="text-destructive">{inscription.dateFin}</TableCell>
                    <TableCell>{inscription.telephone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {statsExpirees.total > 7 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Voir tout ({statsExpirees.total})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inscriptions Bientôt Expirées */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarX className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-orange-600">Expiration Proche</CardTitle>
              </div>
              <span className="text-2xl font-bold text-orange-600">{statsBientotExpirees.total}</span>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{statsBientotExpirees.femmes} femmes</span>
              <span>{statsBientotExpirees.enfants} enfants</span>
              <span>{statsBientotExpirees.adultes} adultes</span>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Date fin</TableHead>
                  <TableHead>Téléphone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inscriptionsBientotExpireesList.map((inscription, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {inscription.prenom} {inscription.nom}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        inscription.categorie === 'Femme' ? 'bg-pink-100 text-pink-800' :
                        inscription.categorie === 'Enfant' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {inscription.categorie}
                      </span>
                    </TableCell>
                    <TableCell className="text-orange-600 font-medium">{inscription.dateFin}</TableCell>
                    <TableCell>{inscription.telephone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {statsBientotExpirees.total > 7 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Voir tout ({statsBientotExpirees.total})
                </Button>
              </div>
            )}
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