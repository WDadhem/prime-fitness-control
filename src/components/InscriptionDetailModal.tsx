
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Phone, Clock, CreditCard } from "lucide-react";

interface InscriptionDetail {
  nom: string;
  prenom: string;
  age?: number;
  telephone: string;
  specialite: string;
  categorie: string;
  dateDebut: string;
  dateFin: string;
  dureeAbonnement: string;
  prixTotal: number;
  etatSante?: string;
}

interface InscriptionDetailModalProps {
  inscription: InscriptionDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InscriptionDetailModal({ inscription, isOpen, onClose }: InscriptionDetailModalProps) {
  if (!inscription) return null;

  const getCategoryBadge = (categorie: string) => {
    const colors = {
      "Femme": "bg-pink-100 text-pink-800",
      "Enfant": "bg-blue-100 text-blue-800",
      "Adulte": "bg-green-100 text-green-800"
    };
    return (
      <Badge className={colors[categorie as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {categorie}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Détails de l'inscription
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informations personnelles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom</label>
              <p className="font-medium">{inscription.nom}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Prénom</label>
              <p className="font-medium">{inscription.prenom}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
              <div className="mt-1">
                {getCategoryBadge(inscription.categorie)}
              </div>
            </div>
            {inscription.age && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Âge</label>
                <p className="font-medium">{inscription.age} ans</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Téléphone:</span>
            <span className="font-medium">{inscription.telephone}</span>
          </div>

          {/* Informations abonnement */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Abonnement</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Spécialité</label>
                <p className="font-medium">{inscription.specialite}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date début</label>
                    <p className="text-sm">{inscription.dateDebut}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date fin</label>
                    <p className="text-sm">{inscription.dateFin}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Durée</label>
                    <p className="text-sm">{inscription.dureeAbonnement}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prix</label>
                    <p className="text-sm font-medium">{inscription.prixTotal} DT</p>
                  </div>
                </div>
              </div>

              {inscription.etatSante && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">État de santé</label>
                  <p className="text-sm">{inscription.etatSante}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
