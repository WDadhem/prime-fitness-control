
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, User, CreditCard, Clock, MapPin } from "lucide-react";

interface InscriptionDetail {
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
  created_at?: string;
}

interface InscriptionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inscription: InscriptionDetail | null;
}

export default function InscriptionDetailModal({ 
  isOpen, 
  onClose, 
  inscription 
}: InscriptionDetailModalProps) {
  if (!inscription) return null;

  const getStatusBadge = (dateFin: string) => {
    const today = new Date();
    const endDate = new Date(dateFin);
    const diffTime = endDate.getTime() - today.getTime();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Détails de l'inscription
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations personnelles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Informations personnelles</h3>
              <div className="space-y-1">
                <p><strong>Nom:</strong> {inscription.nom}</p>
                <p><strong>Prénom:</strong> {inscription.prenom}</p>
                <p><strong>Âge:</strong> {inscription.age} ans</p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {inscription.telephone}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Catégorie & Statut</h3>
              <div className="space-y-2">
                {getCategoryBadge(inscription.categorie)}
                {getStatusBadge(inscription.date_fin)}
              </div>
            </div>
          </div>

          {/* Informations d'inscription */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Détails de l'inscription</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p><strong>Spécialité:</strong> {inscription.specialite}</p>
                <p><strong>Durée:</strong> {inscription.duree_abonnement}</p>
                <p className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <strong>Prix:</strong> {inscription.prix_total} DT
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <strong>Date début:</strong> {new Date(inscription.date_debut).toLocaleDateString('fr-FR')}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <strong>Date fin:</strong> {new Date(inscription.date_fin).toLocaleDateString('fr-FR')}
                </p>
                {inscription.created_at && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Inscrit le:</strong> {new Date(inscription.created_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
