import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: authLoading } = useAuth();

  // Rediriger si l'utilisateur est déjà connecté et admin
  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        toast({
          title: "Erreur de connexion",
          description: "Identifiants invalides. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (adminError || !adminData) {
        // Sign out if not an admin
        await supabase.auth.signOut();
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administrateur.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${adminData.prenom} ${adminData.nom}`,
      });

      // La navigation sera gérée par useEffect quand isAdmin sera mis à jour
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">O</span>
          </div>
          <CardTitle className="text-2xl font-bold">Oxygène Sports Djerba</CardTitle>
          <CardDescription>Interface d'administration - Connexion sécurisée</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@oxygene.djerba"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-center">
            <p className="font-medium mb-2">Identifiants de test :</p>
            <p>Email: admin@oxygene.djerba</p>
            <p>Mot de passe: oxygene2024</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}