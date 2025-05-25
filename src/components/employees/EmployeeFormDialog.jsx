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
import { User, Briefcase, DollarSign, Users2, ShieldCheck, Phone } from 'lucide-react';

const EmployeeFormDialog = ({ isOpen, onClose, onSubmit, employee, employeeRoles, employeeStatus }) => {
  const [formData, setFormData] = useState({
    nom: '',
    poste: '',
    telephone: '',
    disponibilite: '',
    salaireJournalier: '',
    competences: '',
    avatar: '',
    equipe: '',
    nbManutentionnairesEquipe: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        nom: employee.nom || '',
        poste: employee.poste || '',
        telephone: employee.telephone || '',
        disponibilite: employee.disponibilite || '',
        salaireJournalier: employee.salaireJournalier || '',
        competences: employee.competences || '',
        avatar: employee.avatar || '',
        equipe: employee.equipe || '',
        nbManutentionnairesEquipe: employee.nbManutentionnairesEquipe || '',
      });
    } else {
      setFormData({ nom: '', poste: '', telephone: '', disponibilite: '', salaireJournalier: '', competences: '', avatar: '', equipe: '', nbManutentionnairesEquipe: '' });
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
     if (name === 'poste' && value !== "Chef d'équipe") {
      setFormData(prev => ({ ...prev, equipe: '', nbManutentionnairesEquipe: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (dataToSubmit.poste !== "Chef d'équipe") {
      delete dataToSubmit.equipe;
      delete dataToSubmit.nbManutentionnairesEquipe;
    } else {
       dataToSubmit.nbManutentionnairesEquipe = dataToSubmit.nbManutentionnairesEquipe ? parseInt(dataToSubmit.nbManutentionnairesEquipe, 10) : 0;
    }
    dataToSubmit.salaireJournalier = parseFloat(dataToSubmit.salaireJournalier);
    dataToSubmit.avatar = dataToSubmit.avatar || `https://avatar.vercel.sh/${dataToSubmit.nom.split(' ').join('')}.png?size=128`;
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
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
                  <Label htmlFor="nbManutentionnairesEquipe"><ShieldCheck className="inline-block mr-2 h-4 w-4 text-primary" />Nombre de Manutentionnaires dans l'équipe</Label>
                  <Input id="nbManutentionnairesEquipe" name="nbManutentionnairesEquipe" type="number" min="0" value={formData.nbManutentionnairesEquipe} onChange={handleChange} placeholder="Ex: 3" />
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
              <Label htmlFor="salaireJournalier"><DollarSign className="inline-block mr-2 h-4 w-4 text-primary" />Salaire Journalier (€)</Label>
              <Input id="salaireJournalier" name="salaireJournalier" type="number" step="0.01" value={formData.salaireJournalier} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="competences">Compétences (séparées par des virgules)</Label>
              <Input id="competences" name="competences" value={formData.competences} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="avatar">URL de l'Avatar (optionnel)</Label>
              <Input id="avatar" name="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://example.com/avatar.jpg"/>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">{employee ? "Sauvegarder" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;