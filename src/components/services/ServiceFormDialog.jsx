import React, { useState, useEffect, useCallback } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Users, DollarSign, Box } from 'lucide-react';
import { format, parseISO, setHours, setMinutes, isValid } from "date-fns";
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

const serviceTypes = ["Déménagement Particulier", "Transfert Entreprise", "Garde-meuble", "Location Monte-Meuble", "Autre"];
const serviceStatusOptions = ["Planifiée", "Confirmée", "En cours", "Terminée", "Annulée", "Reportée"];

const ServiceFormDialog = ({ isOpen, onClose, onSubmit, service: initialService }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    client_id: '',
    type_prestation: serviceTypes[0],
    description: '',
    date_prestation: new Date().toISOString(),
    time_prestation: '09:00',
    adresse_depart: '',
    adresse_arrivee: '',
    volume_m3: '',
    statut: serviceStatusOptions[0],
    prix_estime: '',
    notes_instructions: '',
    // equipe_affectee_id: '', // To be added if employee management is fully integrated
    // vehicule_affecte_id: '', // To be added if vehicle management is fully integrated
    // nombre_manutentionnaires_requis: '', // To be added
  });

  const [clients, setClients] = useState([]);
  // const [employees, setEmployees] = useState([]); // For team assignment
  // const [vehicles, setVehicles] = useState([]); // For vehicle assignment

  const fetchRelatedData = useCallback(async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase.from('clients').select('id, nom').order('nom');
      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Add fetching for employees (chefs d'equipe) and vehicles if those features are ready
    } catch (error) {
      console.error("Error fetching related data for service form:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de charger les clients.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchRelatedData();
      if (initialService) {
        const serviceDate = initialService.date_prestation && isValid(parseISO(initialService.date_prestation)) ? parseISO(initialService.date_prestation) : new Date();
        setFormData({
          client_id: initialService.client_id || '',
          type_prestation: initialService.type_prestation || serviceTypes[0],
          description: initialService.description || '',
          date_prestation: serviceDate.toISOString(),
          time_prestation: format(serviceDate, "HH:mm"),
          adresse_depart: initialService.adresse_depart || '',
          adresse_arrivee: initialService.adresse_arrivee || '',
          volume_m3: initialService.volume_m3 || '',
          statut: initialService.statut || serviceStatusOptions[0],
          prix_estime: initialService.prix_estime || '',
          notes_instructions: initialService.notes_instructions || '',
        });
      } else {
        setFormData({
          client_id: '', type_prestation: serviceTypes[0], description: '',
          date_prestation: new Date().toISOString(), time_prestation: '09:00',
          adresse_depart: '', adresse_arrivee: '', volume_m3: '',
          statut: serviceStatusOptions[0], prix_estime: '', notes_instructions: '',
        });
      }
    }
  }, [initialService, isOpen, fetchRelatedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (selectedDate) => {
    if (selectedDate && isValid(selectedDate)) {
      setFormData(prev => ({ ...prev, date_prestation: selectedDate.toISOString() }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let combinedDateTime = new Date();
    if (formData.date_prestation && isValid(parseISO(formData.date_prestation))) {
        combinedDateTime = parseISO(formData.date_prestation);
    }
    
    const [hours, minutes] = formData.time_prestation.split(':');
    combinedDateTime = setHours(combinedDateTime, parseInt(hours, 10));
    combinedDateTime = setMinutes(combinedDateTime, parseInt(minutes, 10));
    
    const payload = { 
      ...formData, 
      date_prestation: combinedDateTime.toISOString(),
      volume_m3: formData.volume_m3 ? parseFloat(formData.volume_m3) : null,
      prix_estime: formData.prix_estime ? parseFloat(formData.prix_estime) : null,
    };
    delete payload.time_prestation; // Not a DB field
    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialService ? "Modifier la Prestation" : "Planifier une Nouvelle Prestation"}</DialogTitle>
          <DialogDescription>
            {initialService ? "Modifiez les détails de la prestation." : "Remplissez les détails pour planifier une nouvelle prestation."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
            <div>
              <Label htmlFor="client_id">Client *</Label>
              <Select name="client_id" value={formData.client_id} onValueChange={(value) => handleSelectChange('client_id', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type_prestation">Type de Prestation *</Label>
              <Select name="type_prestation" value={formData.type_prestation} onValueChange={(value) => handleSelectChange('type_prestation', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description de la prestation</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Ex: Déménagement appartement T3, 2ème étage sans ascenseur..." />
            </div>

            <div>
              <Label htmlFor="date_prestation">Date de la Prestation *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_prestation && isValid(parseISO(formData.date_prestation)) ? format(parseISO(formData.date_prestation), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.date_prestation && isValid(parseISO(formData.date_prestation)) ? parseISO(formData.date_prestation) : new Date()} onSelect={handleDateChange} initialFocus locale={fr} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="time_prestation">Heure de Début *</Label>
              <Input id="time_prestation" name="time_prestation" type="time" value={formData.time_prestation} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="adresse_depart">Adresse de Départ *</Label>
              <Input id="adresse_depart" name="adresse_depart" value={formData.adresse_depart} onChange={handleChange} required placeholder="Ex: 1 Rue de la Paix, 75002 Paris"/>
            </div>
            <div>
              <Label htmlFor="adresse_arrivee">Adresse d'Arrivée *</Label>
              <Input id="adresse_arrivee" name="adresse_arrivee" value={formData.adresse_arrivee} onChange={handleChange} required placeholder="Ex: 15 Av. des Champs-Élysées, 75008 Paris"/>
            </div>

            <div>
              <Label htmlFor="volume_m3"><Box className="inline-block mr-2 h-4 w-4 text-primary" />Volume Estimé (m³)</Label>
              <Input id="volume_m3" name="volume_m3" type="number" step="0.1" value={formData.volume_m3} onChange={handleChange} placeholder="Ex: 30"/>
            </div>
            <div>
              <Label htmlFor="prix_estime"><DollarSign className="inline-block mr-2 h-4 w-4 text-primary" />Prix Estimé (€)</Label>
              <Input id="prix_estime" name="prix_estime" type="number" step="0.01" value={formData.prix_estime} onChange={handleChange} placeholder="Ex: 1200.50"/>
            </div>
            
            <div>
              <Label htmlFor="statut">Statut *</Label>
              <Select name="statut" value={formData.statut} onValueChange={(value) => handleSelectChange('statut', value)} required>
                <SelectTrigger><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger>
                <SelectContent>
                  {serviceStatusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Placeholder for team, vehicle, movers - to be implemented with respective modules */}
            {/* 
            <div>
              <Label htmlFor="equipe_affectee_id">Chef d'Équipe</Label>
              <Select name="equipe_affectee_id" value={formData.equipe_affectee_id} onValueChange={(value) => handleSelectChange('equipe_affectee_id', value)}>
                <SelectTrigger><SelectValue placeholder="Assigner une équipe" /></SelectTrigger>
                <SelectContent>{employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.nom} {emp.prenom}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            */}

            <div className="md:col-span-2">
              <Label htmlFor="notes_instructions">Notes / Instructions Spécifiques</Label>
              <Textarea id="notes_instructions" name="notes_instructions" value={formData.notes_instructions} onChange={handleChange} placeholder="Ex: Objets fragiles à manipuler avec soin, accès difficile, contacter M. Dupont à l'arrivée..." />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">{initialService ? "Sauvegarder les Modifications" : "Planifier la Prestation"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceFormDialog;