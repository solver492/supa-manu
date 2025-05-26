
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const EmployeeFormDialog = ({ isOpen, onClose, onSubmit, employee }) => {
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    poste: '',
    equipe: '',
    nb_manutentionnaires_equipe: 1,
    disponibilite: 'Disponible',
    salaire_journalier: '',
    competences: '',
    avatar_url: '',
    date_embauche: new Date().toISOString().split('T')[0],
    actif: true
  });

  const [errors, setErrors] = useState({});

  const postes = [
    'Chef d\'équipe',
    'Manutentionnaire',
    'Chauffeur',
    'Déménageur',
    'Coordinateur',
    'Assistant',
    'Superviseur'
  ];

  const equipes = [
    'Équipe A',
    'Équipe B',
    'Équipe C',
    'Équipe D',
    'Équipe Spécialisée',
    'Équipe Mobile'
  ];

  const disponibilites = [
    'Disponible',
    'Occupé',
    'En congé',
    'Arrêt maladie',
    'Formation'
  ];

  useEffect(() => {
    if (employee) {
      setFormData({
        nom: employee.nom || '',
        telephone: employee.telephone || '',
        email: employee.email || '',
        poste: employee.poste || '',
        equipe: employee.equipe || '',
        nb_manutentionnaires_equipe: employee.nb_manutentionnaires_equipe || 1,
        disponibilite: employee.disponibilite || 'Disponible',
        salaire_journalier: employee.salaire_journalier || '',
        competences: employee.competences || '',
        avatar_url: employee.avatar_url || '',
        date_embauche: employee.date_embauche || new Date().toISOString().split('T')[0],
        actif: employee.actif !== undefined ? employee.actif : true
      });
    } else {
      setFormData({
        nom: '',
        telephone: '',
        email: '',
        poste: '',
        equipe: '',
        nb_manutentionnaires_equipe: 1,
        disponibilite: 'Disponible',
        salaire_journalier: '',
        competences: '',
        avatar_url: '',
        date_embauche: new Date().toISOString().split('T')[0],
        actif: true
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    if (!formData.poste) {
      newErrors.poste = 'Le poste est requis';
    }

    if (!formData.equipe) {
      newErrors.equipe = 'L\'équipe est requise';
    }

    if (formData.salaire_journalier && isNaN(parseFloat(formData.salaire_journalier))) {
      newErrors.salaire_journalier = 'Le salaire doit être un nombre valide';
    }

    if (isNaN(parseInt(formData.nb_manutentionnaires_equipe)) || parseInt(formData.nb_manutentionnaires_equipe) < 1) {
      newErrors.nb_manutentionnaires_equipe = 'Le nombre doit être un entier positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {employee ? 'Modifier l\'employé' : 'Ajouter un employé'}
          </DialogTitle>
          <DialogDescription>
            {employee ? 'Modifiez les informations de l\'employé.' : 'Remplissez les informations pour ajouter un nouvel employé.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                placeholder="Ex: Jean Dupont"
                className={errors.nom ? 'border-red-500' : ''}
              />
              {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="jean.dupont@exemple.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="Ex: 01 23 45 67 89"
                className={errors.telephone ? 'border-red-500' : ''}
              />
              {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_embauche">Date d'embauche</Label>
              <Input
                id="date_embauche"
                type="date"
                value={formData.date_embauche}
                onChange={(e) => handleInputChange('date_embauche', e.target.value)}
              />
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poste">Poste *</Label>
              <Select 
                value={formData.poste} 
                onValueChange={(value) => handleInputChange('poste', value)}
              >
                <SelectTrigger className={errors.poste ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un poste" />
                </SelectTrigger>
                <SelectContent>
                  {postes.map((poste) => (
                    <SelectItem key={poste} value={poste}>
                      {poste}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.poste && <p className="text-sm text-red-500">{errors.poste}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipe">Équipe *</Label>
              <Select 
                value={formData.equipe} 
                onValueChange={(value) => handleInputChange('equipe', value)}
              >
                <SelectTrigger className={errors.equipe ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner une équipe" />
                </SelectTrigger>
                <SelectContent>
                  {equipes.map((equipe) => (
                    <SelectItem key={equipe} value={equipe}>
                      {equipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.equipe && <p className="text-sm text-red-500">{errors.equipe}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nb_manutentionnaires_equipe">Nombre de Manutentionnaires dans l'équipe</Label>
              <Input
                id="nb_manutentionnaires_equipe"
                type="number"
                min="1"
                value={formData.nb_manutentionnaires_equipe}
                onChange={(e) => handleInputChange('nb_manutentionnaires_equipe', e.target.value)}
                className={errors.nb_manutentionnaires_equipe ? 'border-red-500' : ''}
              />
              {errors.nb_manutentionnaires_equipe && <p className="text-sm text-red-500">{errors.nb_manutentionnaires_equipe}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="disponibilite">Disponibilité</Label>
              <Select 
                value={formData.disponibilite} 
                onValueChange={(value) => handleInputChange('disponibilite', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la disponibilité" />
                </SelectTrigger>
                <SelectContent>
                  {disponibilites.map((dispo) => (
                    <SelectItem key={dispo} value={dispo}>
                      {dispo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaire_journalier">Salaire Journalier (€)</Label>
            <Input
              id="salaire_journalier"
              type="number"
              step="0.01"
              min="0"
              value={formData.salaire_journalier}
              onChange={(e) => handleInputChange('salaire_journalier', e.target.value)}
              placeholder="Ex: 150.00"
              className={errors.salaire_journalier ? 'border-red-500' : ''}
            />
            {errors.salaire_journalier && <p className="text-sm text-red-500">{errors.salaire_journalier}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="competences">Compétences (séparées par des virgules)</Label>
            <Textarea
              id="competences"
              value={formData.competences}
              onChange={(e) => handleInputChange('competences', e.target.value)}
              placeholder="Ex: Conduite poids lourd, Manutention lourde, Piano"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">URL de l'Avatar (optionnel)</Label>
            <Input
              id="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={(e) => handleInputChange('avatar_url', e.target.value)}
              placeholder="https://exemple.com/avatar.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="actif"
              checked={formData.actif}
              onCheckedChange={(checked) => handleInputChange('actif', checked)}
            />
            <Label htmlFor="actif">Employé actif</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
              {employee ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
