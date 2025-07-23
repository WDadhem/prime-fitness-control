import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Offre {
  id: string;
  nom: string;
  coach: string | null;
  categorie: string;
  prix: number;
  description: string | null;
}

interface InscriptionFormProps {
  onSuccess: () => void;
  editingInscription?: {
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
  } | null;
}

export default function InscriptionForm({ onSuccess, editingInscription }: InscriptionFormProps) {
  const [categorie, setCategorie] = useState("");
  const [offres, setOffres] = useState<Offre[]>([]);
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null);
  const [duree, setDuree] = useState("");
  const [dateDebut, setDateDebut] = useState<Date>();
  const [dateFin, setDateFin] = useState<Date>();
  const [prixTotal, setPrixTotal] = useState(0);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    age: "",
    telephone: "",
    dateNaissance: undefined as Date | undefined,
    etatSante: "",
    specialite: ""
  });
  const { toast } = useToast();

  const dureeOptions = [
    { value: "1", label: "1 mois", multiplier: 1 },
    { value: "2", label: "2 mois", multiplier: 2 },
    { value: "3", label: "3 mois", multiplier: 2.8 },
    { value: "6", label: "6 mois", multiplier: 5.5 },
    { value: "12", label: "1 an", multiplier: 10 }
  ];

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  };

  // Function to calculate date of birth from age
  const calculateDateOfBirth = (age: number) => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return new Date(birthYear, today.getMonth(), today.getDate());
  };

  // Effect pour charger les données d'édition
  useEffect(() => {
    if (editingInscription) {
      setCategorie(editingInscription.categorie);
      
      // Pour les enfants, calculer la date de naissance à partir de l'âge
      let dateNaissance: Date | undefined = undefined;
      if (editingInscription.categorie === 'Enfant' && editingInscription.age) {
        dateNaissance = calculateDateOfBirth(editingInscription.age);
      }
      
      setFormData({
        nom: editingInscription.nom,
        prenom: editingInscription.prenom,
        age: editingInscription.age ? editingInscription.age.toString() : "",
        telephone: editingInscription.telephone,
        dateNaissance: dateNaissance,
        etatSante: "",
        specialite: editingInscription.specialite
      });
      setDateDebut(new Date(editingInscription.date_debut));
      setDateFin(new Date(editingInscription.date_fin));
      setPrixTotal(editingInscription.prix_total);
      
      // Calculer la durée à partir des dates
      const debut = new Date(editingInscription.date_debut);
      const fin = new Date(editingInscription.date_fin);
      const diffMonths = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
      setDuree(diffMonths.toString());
    }
  }, [editingInscription]);

  // Effect pour calculer l'âge automatiquement pour les enfants
  useEffect(() => {
    if (categorie === 'Enfant' && formData.dateNaissance) {
      const age = calculateAge(formData.dateNaissance);
      setFormData(prev => ({...prev, age: age.toString()}));
    }
  }, [formData.dateNaissance, categorie]);

  useEffect(() => {
    if (categorie) {
      fetchOffres();
    }
  }, [categorie]);

  // Effect pour sélectionner l'offre lors de l'édition
  useEffect(() => {
    if (editingInscription && offres.length > 0) {
      const offreFound = offres.find(o => o.nom === editingInscription.specialite);
      if (offreFound) {
        setSelectedOffre(offreFound);
      }
    }
  }, [offres, editingInscription]);

  useEffect(() => {
    if (selectedOffre && duree) {
      const dureeOption = dureeOptions.find(d => d.value === duree);
      if (dureeOption) {
        setPrixTotal(selectedOffre.prix * dureeOption.multiplier);
      }
    }
  }, [selectedOffre, duree]);

  useEffect(() => {
    if (dateDebut && duree) {
      const nouveDateFin = new Date(dateDebut);
      nouveDateFin.setMonth(nouveDateFin.getMonth() + parseInt(duree));
      setDateFin(nouveDateFin);
    }
  }, [dateDebut, duree]);

  const fetchOffres = async () => {
    const { data, error } = await supabase
      .from('offres')
      .select('*')
      .eq('categorie', categorie === 'Adulte' ? 'Adulte' : categorie);
    
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres",
        variant: "destructive"
      });
      return;
    }

    setOffres(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOffre || !dateDebut || !dateFin) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // Validation spécifique pour les enfants
    if (categorie === 'Enfant') {
      if (!formData.dateNaissance) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner la date de naissance de l'enfant",
          variant: "destructive"
        });
        return;
      }

      const age = calculateAge(formData.dateNaissance);
      if (age < 3 || age > 15) {
        toast({
          title: "Erreur",
          description: "L'âge de l'enfant doit être compris entre 3 et 15 ans",
          variant: "destructive"
        });
        return;
      }
    }

    // Calculer l'âge pour les enfants ou utiliser l'âge saisi pour les autres
    const ageToSave = categorie === 'Enfant' && formData.dateNaissance 
      ? calculateAge(formData.dateNaissance) 
      : parseInt(formData.age);

    const inscriptionData = {
      nom: formData.nom,
      prenom: formData.prenom,
      age: ageToSave,
      telephone: formData.telephone,
      specialite: selectedOffre.nom,
      date_debut: format(dateDebut, 'yyyy-MM-dd'),
      date_fin: format(dateFin, 'yyyy-MM-dd'),
      duree_abonnement: dureeOptions.find(d => d.value === duree)?.label || "",
      offre_id: selectedOffre.id,
      prix_total: prixTotal,
      ...(categorie === 'Enfant' && { etat_sante: formData.etatSante })
    };

    let error;
    
    if (editingInscription) {
      // Mode édition - mettre à jour l'inscription existante
      if (categorie === 'Enfant') {
        const { error: updateError } = await supabase
          .from('inscriptions_enfants')
          .update(inscriptionData)
          .eq('id', editingInscription.id);
        error = updateError;
      } else if (categorie === 'Adulte') {
        const { error: updateError } = await supabase
          .from('inscriptions_adultes')
          .update(inscriptionData)
          .eq('id', editingInscription.id);
        error = updateError;
      } else if (categorie === 'Femme') {
        const { error: updateError } = await supabase
          .from('inscriptions_femmes')
          .update(inscriptionData)
          .eq('id', editingInscription.id);
        error = updateError;
      }
    } else {
      // Mode création - créer une nouvelle inscription
      if (categorie === 'Enfant') {
        const { error: insertError } = await supabase
          .from('inscriptions_enfants')
          .insert([inscriptionData]);
        error = insertError;
      } else if (categorie === 'Adulte') {
        const { error: insertError } = await supabase
          .from('inscriptions_adultes')
          .insert([inscriptionData]);
        error = insertError;
      } else if (categorie === 'Femme') {
        const { error: insertError } = await supabase
          .from('inscriptions_femmes')
          .insert([inscriptionData]);
        error = insertError;
      }
    }

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'inscription",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Succès",
      description: editingInscription ? "Inscription modifiée avec succès" : "Inscription enregistrée avec succès"
    });
    
    onSuccess();
    resetForm();
  };

  const resetForm = () => {
    setCategorie("");
    setSelectedOffre(null);
    setDuree("");
    setDateDebut(undefined);
    setDateFin(undefined);
    setPrixTotal(0);
    setFormData({
      nom: "",
      prenom: "",
      age: "",
      telephone: "",
      dateNaissance: undefined,
      etatSante: "",
      specialite: ""
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {editingInscription ? "Modifier l'inscription" : "Nouvelle Inscription"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categorie">Catégorie *</Label>
            <Select value={categorie} onValueChange={setCategorie} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Enfant">Enfant</SelectItem>
                <SelectItem value="Femme">Femme</SelectItem>
                <SelectItem value="Adulte">Adulte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {categorie === 'Enfant' ? (
            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateNaissance && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateNaissance ? format(formData.dateNaissance, "dd/MM/yyyy") : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateNaissance}
                    onSelect={(date) => setFormData({...formData, dateNaissance: date})}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => {
                      const today = new Date();
                      const minDate = new Date();
                      minDate.setFullYear(today.getFullYear() - 15);
                      const maxDate = new Date();
                      maxDate.setFullYear(today.getFullYear() - 3);
                      return date > maxDate || date < minDate;
                    }}
                  />
                </PopoverContent>
              </Popover>
              {formData.dateNaissance && (
                <p className="text-sm text-muted-foreground">
                  Âge: {calculateAge(formData.dateNaissance)} ans
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                L'enfant doit avoir entre 3 et 15 ans
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="age">Âge *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              required
            />
          </div>

          {categorie === 'Enfant' && (
            <div>
              <Label htmlFor="etatSante">État de santé</Label>
              <Textarea
                id="etatSante"
                value={formData.etatSante}
                onChange={(e) => setFormData({...formData, etatSante: e.target.value})}
                placeholder="Informations médicales importantes..."
              />
            </div>
          )}

          {categorie && (
            <div>
              <Label htmlFor="specialite">Spécialité *</Label>
              <Select 
                value={selectedOffre?.id || ""} 
                onValueChange={(value) => {
                  const offre = offres.find(o => o.id === value);
                  setSelectedOffre(offre || null);
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une spécialité" />
                </SelectTrigger>
                <SelectContent>
                  {offres.map((offre) => (
                    <SelectItem key={offre.id} value={offre.id}>
                      {offre.nom} {offre.coach && `(${offre.coach})`} - {offre.prix}€
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="duree">Durée d'abonnement *</Label>
            <Select value={duree} onValueChange={setDuree} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une durée" />
              </SelectTrigger>
              <SelectContent>
                {dureeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateDebut">Date début abonnement *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateDebut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateDebut ? format(dateDebut, "dd/MM/yyyy") : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateDebut}
                  onSelect={setDateDebut}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {dateFin && (
            <div>
              <Label>Date fin abonnement</Label>
              <Input
                value={format(dateFin, "dd/MM/yyyy")}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          {prixTotal > 0 && (
            <div className="p-4 bg-gym-yellow/10 rounded-lg">
              <div className="text-lg font-semibold text-gym-navy">
                Prix total: {prixTotal.toFixed(2)}€
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="bg-gym-yellow text-black hover:bg-gym-yellow/90">
              {editingInscription ? "Modifier l'inscription" : "Enregistrer l'inscription"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}