
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

const EmployeeFormDialog = ({ isOpen, onClose, onSubmit, employee }) => {
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    poste: '',
    equipe: '',
    nb_manutentionnaires_equipe: '',
    disponibilite: 'Disponible',
    salaire_journalier: '',
    competences: '',
    avatar_url: '',
    date_embauche: new Date(),
    actif: true
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        nom: employee.nom || '',
        telephone: employee.telephone || '',
        email: employee.email || '',
        poste: employee.poste || '',
        equipe: employee.equipe || '',
        nb_manutentionnaires_equipe: employee.nb_manutentionnaires_equipe || '',
        disponibilite: employee.disponibilite || 'Disponible',
        salaire_journalier: employee.salaire_journalier || '',
        competences: employee.competences || '',
        avatar_url: employee.avatar_url || '',
        date_embauche: employee.date_embauche ? new Date(employee.date_embauche) : new Date(),
        actif: employee.actif !== undefined ? employee.actif : true
      });
    } else {
      setFormData({
        nom: '',
        telephone: '',
        email: '',
        poste: '',
        equipe: '',
        nb_manutentionnaires_equipe: '',
        disponibilite: 'Disponible',
        salaire_journalier: '',
        competences: '',
        avatar_url: '',
        date_embauche: new Date(),
        actif: true
      });
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date_embauche: date }));
    setDatePickerOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!formData.nom.trim()) {
      alert('Le nom est requis');
      return;
    }
    if (!formData.email.trim()) {
      alert('L\'email est requis');
      return;
    }

    // Préparer les données pour l'envoi
    const submitData = {
      ...formData,
      date_embauche: formData.date_embauche.toISOString().split('T')[0], // Format YYYY-MM-DD
      nb_manutentionnaires_equipe: formData.nb_manutentionnaires_equipe ? parseInt(formData.nb_manutentionnaires_equipe) : null,
      salaire_journalier: formData.salaire_journalier ? parseFloat(formData.salaire_journalier) : null
    };

    onSubmit(submitData);
  };

  const disponibiliteOptions = [
    'Disponible',
    'Occupé',
    'En congé',
    'Malade',
    'Formation'
  ];

  const posteOptions = [
    'Manutentionnaire',
    'Chef d\'équipe',
    'Chauffeur',
    'Responsable',
    'Coordinateur',
    'Superviseur'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Modifier l'Employé" : "Ajouter un Nouvel Employé"}
          </DialogTitle>
          <DialogDescription>
            {employee ? "Modifiez les informations de l'employé." : "Remplissez les informations du nouvel employé."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Nom */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom" className="text-right">Nom *</Label>
              <Input 
                id="nom" 
                name="nom" 
                value={formData.nom} 
                onChange={handleChange} 
                className="col-span-3" 
                required 
              />
            </div>

            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleChange} 
                className="col-span-3" 
                required 
              />
            </div>

            {/* Téléphone */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telephone" className="text-right">Téléphone</Label>
              <Input 
                id="telephone" 
                name="telephone" 
                type="tel"
                value={formData.telephone} 
                onChange={handleChange} 
                className="col-span-3" 
              />
            </div>

            {/* Poste */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poste" className="text-right">Poste</Label>
              <Select 
                value={formData.poste} 
                onValueChange={(value) => handleSelectChange('poste', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un poste" />
                </SelectTrigger>
                <SelectContent>
                  {posteOptions.map((poste) => (
                    <SelectItem key={poste} value={poste}>
                      {poste}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Équipe */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equipe" className="text-right">Équipe</Label>
              <Input 
                id="equipe" 
                name="equipe" 
                value={formData.equipe} 
                onChange={handleChange} 
                className="col-span-3" 
                placeholder="Ex: Équipe A, Équipe B..."
              />
            </div>

            {/* Nombre de manutentionnaires dans l'équipe */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nb_manutentionnaires_equipe" className="text-right">
                Nb Manutentionnaires
              </Label>
              <Input 
                id="nb_manutentionnaires_equipe" 
                name="nb_manutentionnaires_equipe" 
                type="number"
                min="0"
                value={formData.nb_manutentionnaires_equipe} 
                onChange={handleChange} 
                className="col-span-3" 
                placeholder="Nombre dans l'équipe"
              />
            </div>

            {/* Disponibilité */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="disponibilite" className="text-right">Disponibilité</Label>
              <Select 
                value={formData.disponibilite} 
                onValueChange={(value) => handleSelectChange('disponibilite', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {disponibiliteOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Salaire journalier */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salaire_journalier" className="text-right">Salaire Journalier (€)</Label>
              <Input 
                id="salaire_journalier" 
                name="salaire_journalier" 
                type="number"
                step="0.01"
                min="0"
                value={formData.salaire_journalier} 
                onChange={handleChange} 
                className="col-span-3" 
                placeholder="150.00"
              />
            </div>

            {/* Date d'embauche */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date d'embauche</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="col-span-3 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_embauche ? format(formData.date_embauche, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date_embauche}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Compétences */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="competences" className="text-right mt-2">Compétences</Label>
              <Textarea 
                id="competences" 
                name="competences" 
                value={formData.competences} 
                onChange={handleChange} 
                className="col-span-3" 
                placeholder="Ex: full-stack, manutention lourde, permis poids lourd..."
                rows={3}
              />
            </div>

            {/* URL Avatar */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar_url" className="text-right">URL Avatar</Label>
              <Input 
                id="avatar_url" 
                name="avatar_url" 
                type="url"
                value={formData.avatar_url} 
                onChange={handleChange} 
                className="col-span-3" 
                placeholder="https://exemple.com/avatar.jpg"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground"
            >
              {employee ? "Sauvegarder" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;
