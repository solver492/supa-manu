
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
import { User, Briefcase, DollarSign, Users2, ShieldCheck, Phone, Mail, Calendar } from 'lucide-react';

const EmployeeFormDialog = ({ isOpen, onClose, onSubmit, employee, employeeRoles, employeeStatus }) => {
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    poste: '',
    equipe: '',
    nb_manutentionnaires_equipe: '',
    disponibilite: '',
    salaire_journalier: '',
    competences: '',
    avatar_url: '',
    date_embauche: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        nom: employee.nom || '',
        telephone: employee.telephone || '',
        email: employee.email || '',
        poste: employee.poste || '',
        equipe: employee.equipe || '',
        nb_manutentionnaires_equipe: employee.nb_manutentionnaires_equipe || '',
        disponibilite: employee.disponibilite || '',
        salaire_journalier: employee.salaire_journalier || '',
        competences: employee.competences || '',
        avatar_url: employee.avatar_url || '',
        date_embauche: employee.date_embauche ? employee.date_embauche.split('T')[0] : '',
      });
    } else {
      setFormData({
        nom: '',
        telephone: '',
        email: '',
        poste: '',
        equipe: '',
        nb_manutentionnaires_equipe: '',
        disponibilite: '',
        salaire_journalier: '',
        competences: '',
        avatar_url: '',
        date_embauche: new Date().toISOString().split('T')[0],
      });
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'poste' && value !== "Chef d'équipe") {
      setFormData(prev => ({ ...prev, equipe: '', nb_manutentionnaires_equipe: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    
    // Nettoyer les données selon le poste
    if (dataToSubmit.poste !== "Chef d'équipe") {
      delete dataToSubmit.equipe;
      delete dataToSubmit.nb_manutentionnaires_equipe;
    } else {
      dataToSubmit.nb_manutentionnaires_equipe = dataToSubmit.nb_manutentionnaires_equipe ? 
        parseInt(dataToSubmit.nb_manutentionnaires_equipe, 10) : null;
    }
    
    // Convertir le salaire en nombre
    dataToSubmit.salaire_journalier = parseFloat(dataToSubmit.salaire_journalier);
    
    // Générer un avatar par défaut si vide
    if (!dataToSubmit.avatar_url) {
      dataToSubmit.avatar_url = `https://avatar.vercel.sh/${dataToSubmit.nom.split(' ').join('')}.png?size=128`;
    }
    
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "Modifier l'Employé" : "Ajouter un Nouvel Employé"}</DialogTitle>
          <DialogDescription>
            {employee ? "Modifiez les informations de l'employé." : "Remplissez les informations du nouvel employé."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="nom"><User className="inline-block mr-2 h-4 w-4 text-primary" />Nom Complet</Label>
              <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="email"><Mail className="inline-block mr-2 h-4 w-4 text-primary" />Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@exemple.com" />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="telephone"><Phone className="inline-block mr-2 h-4 w-4 text-primary" />Téléphone</Label>
              <Input id="telephone" name="telephone" type="tel" value={formData.telephone} onChange={handleChange} placeholder="Ex: 0612345678" />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="poste"><Briefcase className="inline-block mr-2 h-4 w-4 text-primary" />Poste</Label>
              <Select name="poste" value={formData.poste} onValueChange={(value) => handleSelectChange('poste', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner un poste" /></SelectTrigger>
                <SelectContent>
                  {employeeRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            {formData.poste === "Chef d'équipe" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="equipe"><Users2 className="inline-block mr-2 h-4 w-4 text-primary" />Nom de l'Équipe</Label>
                  <Input id="equipe" name="equipe" value={formData.equipe} onChange={handleChange} placeholder="Ex: Équipe Alpha, Les Costauds..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nb_manutentionnaires_equipe"><ShieldCheck className="inline-block mr-2 h-4 w-4 text-primary" />Nombre de Manutentionnaires dans l'équipe</Label>
                  <Input id="nb_manutentionnaires_equipe" name="nb_manutentionnaires_equipe" type="number" min="0" value={formData.nb_manutentionnaires_equipe} onChange={handleChange} placeholder="Ex: 3" />
                </div>
              </>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="disponibilite">Disponibilité</Label>
              <Select name="disponibilite" value={formData.disponibilite} onValueChange={(value) => handleSelectChange('disponibilite', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner une disponibilité" /></SelectTrigger>
                <SelectContent>
                  {employeeStatus.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="salaire_journalier"><DollarSign className="inline-block mr-2 h-4 w-4 text-primary" />Salaire Journalier (€)</Label>
              <Input id="salaire_journalier" name="salaire_journalier" type="number" step="0.01" value={formData.salaire_journalier} onChange={handleChange} required />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="date_embauche"><Calendar className="inline-block mr-2 h-4 w-4 text-primary" />Date d'embauche</Label>
              <Input id="date_embauche" name="date_embauche" type="date" value={formData.date_embauche} onChange={handleChange} />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="competences">Compétences (séparées par des virgules)</Label>
              <Input id="competences" name="competences" value={formData.competences} onChange={handleChange} />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="avatar_url">URL de l'Avatar (optionnel)</Label>
              <Input id="avatar_url" name="avatar_url" value={formData.avatar_url} onChange={handleChange} placeholder="https://example.com/avatar.jpg"/>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
              {employee ? "Sauvegarder" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;
