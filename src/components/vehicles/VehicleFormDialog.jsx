
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Wrench, Calendar, FileText } from 'lucide-react';

const VehicleFormDialog = ({ isOpen, onClose, onSubmit, vehicle, vehicleTypes, vehicleStates }) => {
  const [formData, setFormData] = useState({
    immatriculation: '',
    type: '',
    etat: '',
    capacite: '',
    prochaineMaintenance: '',
    marque: '',
    modele: '',
    annee: '',
    dateAcquisition: '',
    notes: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        immatriculation: vehicle.immatriculation || '',
        type: vehicle.type || '',
        etat: vehicle.etat || '',
        capacite: vehicle.capacite || '',
        prochaineMaintenance: vehicle.prochaineMaintenance || '',
        marque: vehicle.marque || '',
        modele: vehicle.modele || '',
        annee: vehicle.annee ? vehicle.annee.toString() : '',
        dateAcquisition: vehicle.dateAcquisition || '',
        notes: vehicle.notes || '',
      });
    } else {
      setFormData({ 
        immatriculation: '', 
        type: '', 
        etat: '', 
        capacite: '', 
        prochaineMaintenance: '',
        marque: '',
        modele: '',
        annee: '',
        dateAcquisition: '',
        notes: '',
      });
    }
  }, [vehicle, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Modifier le Véhicule" : "Ajouter un Nouveau Véhicule"}</DialogTitle>
          <DialogDescription>
            {vehicle ? "Modifiez les informations du véhicule." : "Remplissez les informations du nouveau véhicule."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="immatriculation">
                  <Truck className="inline-block mr-2 h-4 w-4 text-primary" />
                  Immatriculation *
                </Label>
                <Input 
                  id="immatriculation" 
                  name="immatriculation" 
                  value={formData.immatriculation} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="type">Type de Véhicule *</Label>
                <Select 
                  name="type" 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)} 
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="marque">Marque</Label>
                <Input 
                  id="marque" 
                  name="marque" 
                  value={formData.marque} 
                  onChange={handleChange} 
                  placeholder="Ex: Mercedes, Renault, Iveco"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="modele">Modèle</Label>
                <Input 
                  id="modele" 
                  name="modele" 
                  value={formData.modele} 
                  onChange={handleChange} 
                  placeholder="Ex: Sprinter, Master, Daily"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="annee">Année</Label>
                <Input 
                  id="annee" 
                  name="annee" 
                  type="number" 
                  value={formData.annee} 
                  onChange={handleChange} 
                  min="1990"
                  max={new Date().getFullYear()}
                  placeholder="Ex: 2020"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="capacite">Capacité (ex: 20m³)</Label>
                <Input 
                  id="capacite" 
                  name="capacite" 
                  value={formData.capacite} 
                  onChange={handleChange} 
                  placeholder="Ex: 20m³, 12m³"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="etat">État du Véhicule *</Label>
                <Select 
                  name="etat" 
                  value={formData.etat} 
                  onValueChange={(value) => handleSelectChange('etat', value)} 
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un état" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="dateAcquisition">
                  <Calendar className="inline-block mr-2 h-4 w-4 text-primary" />
                  Date d'Acquisition
                </Label>
                <Input 
                  id="dateAcquisition" 
                  name="dateAcquisition" 
                  type="date" 
                  value={formData.dateAcquisition} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="prochaineMaintenance">
                <Wrench className="inline-block mr-2 h-4 w-4 text-primary" />
                Prochaine Maintenance
              </Label>
              <Input 
                id="prochaineMaintenance" 
                name="prochaineMaintenance" 
                type="date" 
                value={formData.prochaineMaintenance} 
                onChange={handleChange} 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes">
                <FileText className="inline-block mr-2 h-4 w-4 text-primary" />
                Notes
              </Label>
              <Textarea 
                id="notes" 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Notes supplémentaires concernant le véhicule..."
                rows={3}
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
              {vehicle ? "Sauvegarder" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleFormDialog;
