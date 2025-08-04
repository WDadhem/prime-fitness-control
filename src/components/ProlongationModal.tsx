
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Plus, MapPin, CreditCard, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

interface ProlongationModalProps {
  inscription: Inscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProlongationModal({ inscription, isOpen, onClose, onSuccess }: ProlongationModalProps) {
  const [monthsToAdd, setMonthsToAdd] = useState<string>("");
  const [dateDebutProlongation, setDateDebutProlongation] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [prixParMois, setPrixParMois] = useState<number>(0);
  const { toast } = useToast();

  // Calculer le prix par mois basé sur l'abonnement actuel
  useEffect(() => {
    if (inscription) {
      const dureeMapping = {
        "1 mois": 1,
        "3 mois": 3,
        "6 mois": 6,
        "12 mois": 12
      };
      
      const duree = dureeMapping[inscription.duree_abonnement as keyof typeof dureeMapping] || 1;
      const prixMensuel = inscription.prix_total / duree;
      setPrixParMois(Math.round(prixMensuel));
    }
  }, [inscription]);

  const handleConfirm = async () => {
    if (!inscription || !monthsToAdd || !dateDebutProlongation) return;

    setIsLoading(true);
    
    try {
      // Calculer la nouvelle date de fin basée sur la date de début de prolongation
      const startDate = new Date(dateDebutProlongation);
      const newEndDate = new Date(startDate);
      newEndDate.setMonth(newEndDate.getMonth() + parseInt(monthsToAdd));

      // Mettre à jour selon la catégorie
      let error;
      if (inscription.categorie === 'Enfant') {
        const { error: updateError } = await supabase
          .from('inscriptions_enfants')
          .update({ 
            date_fin: newEndDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', inscription.id);
        error = updateError;
      } else if (inscription.categorie === 'Adulte') {
        const { error: updateError } = await supabase
          .from('inscriptions_adultes')
          .update({ 
            date_fin: newEndDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', inscription.id);
        error = updateError;
      } else if (inscription.categorie === 'Femme') {
        const { error: updateError } = await supabase
          .from('inscriptions_femmes')
          .update({ 
            date_fin: newEndDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', inscription.id);
        error = updateError;
      }

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de prolonger l'inscription",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: `L'inscription a été prolongée de ${monthsToAdd} mois`
      });
      
      onSuccess();
      onClose();
      setMonthsToAdd("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la prolongation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!inscription) return null;

  const currentEndDate = new Date(inscription.date_fin);
  const formattedCurrentEndDate = format(currentEndDate, "dd MMMM yyyy", { locale: fr });
  
  // Calculer le prix total pour la prolongation
  const prixTotal = monthsToAdd ? prixParMois * parseInt(monthsToAdd) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Prolonger l'inscription
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Client</div>
            <div className="font-medium">{inscription.nom} {inscription.prenom}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4" />
              {inscription.specialite}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Prix par mois
              </Label>
              <div className="p-3 bg-muted rounded-md text-sm font-medium">
                {prixParMois} DT
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date de fin actuelle
              </Label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {formattedCurrentEndDate}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date de début de prolongation</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateDebutProlongation && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateDebutProlongation ? (
                    format(dateDebutProlongation, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateDebutProlongation}
                  onSelect={setDateDebutProlongation}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="months">Nombre de mois à ajouter</Label>
            <Select value={monthsToAdd} onValueChange={setMonthsToAdd}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le nombre de mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 mois</SelectItem>
                <SelectItem value="2">2 mois</SelectItem>
                <SelectItem value="3">3 mois</SelectItem>
                <SelectItem value="6">6 mois</SelectItem>
                <SelectItem value="12">12 mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {monthsToAdd && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Prix total de la prolongation:</span>
                <span className="text-xl font-bold text-primary">{prixTotal} DT</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {monthsToAdd} mois × {prixParMois} DT
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!monthsToAdd || !dateDebutProlongation || isLoading}
              className="flex-1 bg-gym-yellow text-white hover:bg-gym-yellow/90"
            >
              {isLoading ? "Prolongation..." : "Confirmer la prolongation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
